package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"website/server"

	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"
)

// this will be set at build time using -ldflags "-X main.release=$(git rev-parse --short HEAD)"
var release string

func main() {
	os.Exit(start())
}

func start() int {
	logEnv := getStringOrDefault("LOG_ENV", "development")
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

	host := getStringOrDefault("HOST", "localhost")
	port := getIntOrDefault("PORT", 8080)

	s := server.New(server.Options{
		Host: host,
		Log:  log,
		Port: port,
	})

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	eg, ctx := errgroup.WithContext(ctx)

	eg.Go(func() error {
		if err := s.Start(); err != nil {
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

func getStringOrDefault(key, defaultValue string) string {
	value, ok := os.LookupEnv(key)
	if !ok {
		return defaultValue
	}
	return value
}

func getIntOrDefault(key string, defaultValue int) int {
	value, ok := os.LookupEnv(key)
	if !ok {
		return defaultValue
	}
	intValue, err := strconv.Atoi(value)
	if err != nil {
		return defaultValue
	}
	return intValue
}
