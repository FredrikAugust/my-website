package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"website/email"
	"website/helpers"
	"website/instrumentation"
	"website/security"
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

	cleanupOtel, err := instrumentation.SetupOTelSDK(ctx, release)
	if err != nil {
		log.Error("failed to set up otel", zap.Error(err))
		return 1
	}

	host := helpers.GetStringOrDefault("HOST", "localhost")
	port := helpers.GetIntOrDefault("PORT", 8080)

	db := createDatatabase(log)
	s3Client := storage.NewS3(helpers.GetStringOrDefault("S3_URL", "https://nbg1.your-objectstorage.com"))

	emailClient := createEmailClient(log)

	turnstileOptions := createTurnstileOptions(log)
	turnstileClient := createTurnstileClient(log)

	s := server.New(server.Options{
		Database:         db,
		S3Client:         s3Client,
		TurnstileOptions: turnstileOptions,
		TurnstileClient:  turnstileClient,
		EmailClient:      emailClient,
		Host:             host,
		Log:              log,
		Port:             port,
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

		log.Debug("stopping open telemetry instrumentation")

		err := cleanupOtel(context.Background())
		if err != nil {
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

func createEmailClient(logger *zap.Logger) email.EmailClient {
	resendAPIKey, ok := os.LookupEnv("RESEND_API_KEY")
	if !ok {
		logger.Warn("no resend api key was provided. falling back to log-only email client. this is only meant for local development")
		return email.NewDummyEmailClient(logger)
	}

	return email.NewEmailClient(email.NewEmailClientOptions{
		APIKey: resendAPIKey,
		Logger: logger,
	})
}

func createTurnstileOptions(log *zap.Logger) *security.TurnstileFrontendOptions {
	sitekey, ok := os.LookupEnv("CF_TURNSTILE_SITEKEY")
	if !ok {
		log.Warn("no Cloudflare Turnstile Sitekey was found. initializing with allow-all")
		sitekey = security.AlwaysPassesVisibleSitekey
	}

	return &security.TurnstileFrontendOptions{
		Sitekey: sitekey,
	}
}

func createTurnstileClient(log *zap.Logger) security.TurnstileClient {
	secret, ok := os.LookupEnv("CF_TURNSTILE_SECRET")
	if !ok {
		log.Warn("no Cloudflare Turnstile secret was found. initializing with allow-all")
		secret = security.AlwaysPassesSecret
	}

	return &security.CfTurnstileClient{
		Secret: secret,
	}
}
