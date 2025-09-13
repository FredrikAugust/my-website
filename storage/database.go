// Package storage provides implementations of databases and migrations
package storage

import (
	"context"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
)

type Database struct {
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

func NewDatabase(opts NewDatabaseOptions) *Database {
	if opts.Log == nil {
		opts.Log = zap.NewNop()
	}
	return &Database{
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

func (db *Database) Connect() error {
	db.log.Info("connecting to database", zap.String("url", db.createDataSourceName(false)))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
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
	db.DB.SetMaxIdleConns(db.maxIdleConnections)

	return nil
}

func (db *Database) createDataSourceName(withPassword bool) string {
	password := db.password
	if !withPassword {
		password = "[REDACTED]"
	}
	return fmt.Sprintf("postgresql://%v:%v@%v:%v/%v?sslmode=disable", db.user, password, db.host, db.port, db.name)
}

func (db *Database) Ping(ctx context.Context) error {
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
