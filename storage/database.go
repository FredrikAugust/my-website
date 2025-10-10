// Package storage provides implementations of databases and migrations
package storage

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/codes"
	semconv "go.opentelemetry.io/otel/semconv/v1.37.0"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

var databaseTracer = otel.GetTracerProvider().Tracer("database")

type PostgresDatabase struct {
	DB                    *sqlx.DB
	host                  string
	port                  int
	user                  string
	password              string
	name                  string
	maxOpenConnections    int
	maxIdleConnections    int
	connectionMaxLifetime time.Duration
	connectionMaxIdleTime time.Duration
	log                   *zap.Logger
}

type NewDatabaseOptions struct {
	Host                  string
	Port                  int
	User                  string
	Password              string
	Name                  string
	MaxOpenConnections    int
	MaxIdleConnections    int
	ConnectionMaxLifetime time.Duration
	ConnectionMaxIdleTime time.Duration
	Log                   *zap.Logger
}

// NewSQLXDatabase creates a new database instance, but does not connect to it.
// For connection, use Database.Connect.
func NewSQLXDatabase(opts NewDatabaseOptions) *PostgresDatabase {
	if opts.Log == nil {
		opts.Log = zap.NewNop()
	}
	return &PostgresDatabase{
		DB:                    nil,
		host:                  opts.Host,
		port:                  opts.Port,
		user:                  opts.User,
		password:              opts.Password,
		name:                  opts.Name,
		maxOpenConnections:    opts.MaxOpenConnections,
		maxIdleConnections:    opts.MaxIdleConnections,
		connectionMaxLifetime: opts.ConnectionMaxLifetime,
		connectionMaxIdleTime: opts.ConnectionMaxIdleTime,
		log:                   opts.Log,
	}
}

func (db *PostgresDatabase) Connect(ctx context.Context) error {
	db.log.Info("connecting to database", zap.String("url", db.createDataSourceName(false)))

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	var err error
	db.DB, err = sqlx.ConnectContext(ctx, "postgres", db.createDataSourceName(true))
	if err != nil {
		return err
	}

	db.log.Debug("setting connection pool options",
		zap.Int("max_open_connections", db.maxOpenConnections),
		zap.Int("max_idle_connections", db.maxIdleConnections),
		zap.Duration("connection_max_lifetime", db.connectionMaxLifetime),
		zap.Duration("connection_max_idle_time", db.connectionMaxIdleTime),
	)
	db.DB.SetMaxOpenConns(db.maxOpenConnections)
	db.DB.SetMaxIdleConns(db.maxIdleConnections)
	db.DB.SetConnMaxLifetime(db.connectionMaxLifetime)
	db.DB.SetConnMaxIdleTime(db.connectionMaxIdleTime)

	return nil
}

func (db *PostgresDatabase) Close() error {
	return db.DB.Close()
}

func (db *PostgresDatabase) createDataSourceName(withPassword bool) string {
	password := db.password
	if !withPassword {
		password = "[REDACTED]"
	}
	return fmt.Sprintf("postgresql://%v:%v@%v:%v/%v?sslmode=disable", db.user, password, db.host, db.port, db.name)
}

func (db *PostgresDatabase) Ping(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, time.Second)
	defer cancel()

	if err := db.DB.PingContext(ctx); err != nil {
		return err
	}

	_, err := db.DB.ExecContext(ctx, "SELECT 1")
	if err != nil {
		return err
	}

	return nil
}

func (db *PostgresDatabase) MustExecContext(ctx context.Context, query string, args ...any) sql.Result {
	ctx, span := databaseTracer.Start(ctx, "database.exec (panic)", trace.WithAttributes(semconv.DBSystemNamePostgreSQL, semconv.DBQueryText(query)))
	defer span.End()

	return db.DB.MustExecContext(ctx, query, args...)
}

func (db *PostgresDatabase) ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error) {
	ctx, span := databaseTracer.Start(ctx, "database.exec", trace.WithAttributes(semconv.DBSystemNamePostgreSQL, semconv.DBQueryText(query)))
	defer span.End()

	result, err := db.DB.ExecContext(ctx, query, args...)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "error during database execution")
		return result, err
	}

	return result, err
}

func (db *PostgresDatabase) QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row {
	ctx, span := databaseTracer.Start(ctx, "database.query_row", trace.WithAttributes(semconv.DBSystemNamePostgreSQL, semconv.DBQueryText(query)))
	defer span.End()

	return db.DB.QueryRowContext(ctx, query, args...)
}

func (db *PostgresDatabase) SelectContext(ctx context.Context, dest any, query string, args ...any) error {
	ctx, span := databaseTracer.Start(ctx, "database.select", trace.WithAttributes(semconv.DBSystemNamePostgreSQL, semconv.DBQueryText(query)))
	defer span.End()

	err := db.DB.SelectContext(ctx, dest, query, args...)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "error during database select")
	}

	return err
}
