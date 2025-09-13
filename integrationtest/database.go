// Package integrationtest provides utilities for setting up and tearing down a test database environment.
// As well as running the actual tests themselves.
package integrationtest

import (
	"os"
	"sync"
	"website/helpers"
	"website/storage"

	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
)

var once sync.Once

func CreateDatabase() (*storage.Database, func()) {
	cwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	godotenv.Load(cwd + "/../.env.test")

	once.Do(initDatabase)

	db, cleanup := connect("postgres")
	defer cleanup()

	// Read about this trick here: https://www.maragu.dk/blog/speeding-up-postgres-integration-tests-in-go/
	dropConnections(db.DB, "template1")

	name := helpers.GetStringOrDefault("DB_NAME", "test")
	db.DB.MustExec("DROP DATABASE IF EXISTS " + name)
	db.DB.MustExec("CREATE DATABASE " + name)

	return connect(name)
}

func initDatabase() {
	db, cleanup := connect("template1")
	defer cleanup()

	// We go up-down-up to ensure the migrations are stable and idempotent
	if err := db.MigrateUp(); err != nil {
		panic(err)
	}
	if err := db.MigrateDown(); err != nil {
		panic(err)
	}
	if err := db.MigrateUp(); err != nil {
		panic(err)
	}

	if err := db.DB.Close(); err != nil {
		panic(err)
	}
}

func connect(name string) (*storage.Database, func()) {
	db := storage.NewDatabase(storage.NewDatabaseOptions{
		Host:               helpers.GetStringOrDefault("DB_HOST", "localhost"),
		Port:               helpers.GetIntOrDefault("DB_PORT", 5432),
		User:               helpers.GetStringOrDefault("DB_USER", "test"),
		Password:           helpers.GetStringOrDefault("DB_PASSWORD", ""),
		Name:               name,
		MaxOpenConnections: 10,
		MaxIdleConnections: 10,
	})

	if err := db.Connect(); err != nil {
		panic(err)
	}

	return db, func() {
		if err := db.DB.Close(); err != nil {
			panic(err)
		}
	}
}

func dropConnections(db *sqlx.DB, name string) {
	db.MustExec(`
		select pg_terminate_backend(pg_stat_activity.pid)
		from pg_stat_activity
		where pg_stat_activity.datname = $1 and pid <> pg_backend_pid()`, name)
}
