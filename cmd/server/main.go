package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"
	"website/helpers"
	"website/server"
	"website/storage"

	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"
)

// this will be set at build time using -ldflags "-X main.release=$(git rev-parse --short HEAD)"
var release string

func main() {
	os.Exit(start())
}

func start() int {
	logEnv := helpers.GetStringOrDefault("LOG_ENV", "development")
	log, err := createLogger(logEnv)

	if err != nil {
		fmt.Println("error setting up the logger:", err)
		return 1
	}

	log = log.With(zap.String("release", release))

	defer func() {
		// if we can't sync there's something seriously wrong so just ignore it
		_ = log.Sync()
	}()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	eg, ctx := errgroup.WithContext(ctx)

	host := helpers.GetStringOrDefault("HOST", "localhost")
	port := helpers.GetIntOrDefault("PORT", 8080)

	db := createDatatabase(log)
	s3Client := storage.NewS3()

	s := server.New(server.Options{
		Database: db,
		S3Client: s3Client,
		Host:     host,
		Log:      log,
		Port:     port,
	})

	eg.Go(func() error {
		if err := s.Start(ctx); err != nil {
			log.Error("failed to start server", zap.Error(err))
			return err
		}
		return nil
	})

	<-ctx.Done()

	eg.Go(func() error {
		if err := s.Stop(); err != nil {
			log.Error("failed to stop server gracefully", zap.Error(err))
			return err
		}
		return nil
	})

	if err := eg.Wait(); err != nil {
		return 1
	}

	return 0
}

func createLogger(logEnv string) (*zap.Logger, error) {
	switch logEnv {
	case "development":
		return zap.NewDevelopment()
	case "production":
		return zap.NewProduction()
	default:
		return zap.NewNop(), nil
	}
}

func createDatatabase(log *zap.Logger) *storage.Database {
	return storage.NewDatabase(storage.NewDatabaseOptions{
		Host:                  helpers.GetStringOrDefault("DB_HOST", "localhost"),
		Port:                  helpers.GetIntOrDefault("DB_PORT", 5432),
		User:                  helpers.GetStringOrDefault("DB_USER", "postgres"),
		Password:              helpers.GetStringOrDefault("DB_PASSWORD", ""),
		Name:                  helpers.GetStringOrDefault("DB_NAME", "website"),
		MaxOpenConnections:    helpers.GetIntOrDefault("DB_MAX_OPEN_CONNECTIONS", 25),
		MaxIdleConnections:    helpers.GetIntOrDefault("DB_MAX_IDLE_CONNECTIONS", 5),
		ConnectionMaxLifetime: helpers.GetDurationOrDefault("DB_CONNECTION_MAX_LIFETIME", 300*time.Second),
		ConnectionMaxIdleTime: helpers.GetDurationOrDefault("DB_CONNECTION_MAX_IDLE_TIME", 60*time.Second),
		Log:                   log,
	})
}
