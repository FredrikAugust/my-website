package main

import (
	"fmt"
	"os"
	"website/helpers"
	"website/storage"

	_ "github.com/joho/godotenv/autoload"
	"go.uber.org/zap"
)

func main() {
	os.Exit(start())
}

func start() int {
	logEnv := helpers.GetStringOrDefault("LOG_ENV", "development")
	log, err := createLogger(logEnv)
	if err != nil {
		fmt.Println("Error setting up the logger:", err)
		return 1
	}

	if len(os.Args) < 2 {
		log.Warn("Usage: migrate up|down")
		return 1
	}

	if os.Args[1] == "to" && len(os.Args) < 3 {
		log.Info("Usage: migrate to <version>")
		return 1
	}

	db := storage.NewDatabase(storage.NewDatabaseOptions{
		Host:     helpers.GetStringOrDefault("DB_HOST", "localhost"),
		Port:     helpers.GetIntOrDefault("DB_PORT", 5432),
		User:     helpers.GetStringOrDefault("DB_USER", ""),
		Password: helpers.GetStringOrDefault("DB_PASSWORD", ""),
		Name:     helpers.GetStringOrDefault("DB_NAME", ""),
		Log:      log,
	})
	if err := db.Connect(); err != nil {
		log.Error("Error connection to database", zap.Error(err))
		return 1
	}

	switch os.Args[1] {
	case "up":
		err = db.MigrateUp()
	case "down":
		err = db.MigrateDown()
	default:
		log.Error("Unknown command", zap.String("name", os.Args[1]))
		return 1
	}
	if err != nil {
		log.Error("Error migrating", zap.Error(err))
		return 1
	}

	return 0
}

func createLogger(env string) (*zap.Logger, error) {
	switch env {
	case "production":
		return zap.NewProduction()
	case "development":
		return zap.NewDevelopment()
	default:
		return zap.NewNop(), nil
	}
}
