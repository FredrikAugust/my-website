package storage

import (
	"embed"
	"errors"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"go.uber.org/zap"
)

func (db *Database) MigrateUp() error {
	m, err := createMigrateInstance(db)
	if err != nil {
		return err
	}

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		db.log.Error("failed to run migrations", zap.Error(err))
		return err
	}

	db.log.Info("up migrations complete")

	return nil
}

func (db *Database) MigrateDown() error {
	m, err := createMigrateInstance(db)
	if err != nil {
		return err
	}

	if err := m.Down(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		db.log.Error("failed to run migrations", zap.Error(err))
		return err
	}

	db.log.Info("down migrations complete")

	return nil
}

//go:embed migrations/*.sql
var migrationsFS embed.FS

func createMigrateInstance(db *Database) (*migrate.Migrate, error) {
	driver, err := postgres.WithInstance(db.DB.DB, &postgres.Config{})
	if err != nil {
		db.log.Error("failed to create migrate driver", zap.Error(err))
		return nil, err
	}
	source, err := iofs.New(migrationsFS, "migrations")
	if err != nil {
		db.log.Error("failed to create migrate source from embed.FS", zap.Error(err))
		return nil, err
	}
	m, err := migrate.NewWithInstance("iofs", source, "postgres", driver)
	if err != nil {
		db.log.Error("failed to create migrate instance", zap.Error(err))
		return nil, err
	}

	return m, nil
}
