// Package server handles setting up and running the HTTP server
package server

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"strconv"
	"time"

	"website/email"
	"website/security"
	"website/storage"

	"github.com/go-chi/chi/v5"
	_ "github.com/joho/godotenv/autoload"
	"go.uber.org/zap"
)

type Server struct {
	address string
	log     *zap.Logger
	mux     chi.Router
	server  *http.Server

	database    *storage.PostgresDatabase
	blobStorage storage.BlobStorage
	emailClient email.EmailClient

	sessionStore storage.SessionStore

	turnstileConfig *security.TurnstileFrontendOptions
	turnstileClient security.TurnstileClient
}

type Options struct {
	Host string
	Port int

	Log *zap.Logger

	Database     *storage.PostgresDatabase
	SessionStore storage.SessionStore

	TurnstileOptions *security.TurnstileFrontendOptions

	BlobStorage     storage.BlobStorage
	EmailClient     email.EmailClient
	TurnstileClient security.TurnstileClient
}

func New(opts Options) *Server {
	if opts.Log == nil {
		fmt.Println("no logger was configured. defaulting to zap.NewNop()")
		opts.Log = zap.NewNop()
	}

	address := net.JoinHostPort(opts.Host, strconv.Itoa(opts.Port))
	mux := chi.NewMux()

	return &Server{
		address:         address,
		database:        opts.Database,
		blobStorage:     opts.BlobStorage,
		emailClient:     opts.EmailClient,
		sessionStore:    opts.SessionStore,
		turnstileConfig: opts.TurnstileOptions,
		turnstileClient: opts.TurnstileClient,
		mux:             mux,
		log:             opts.Log,

		server: &http.Server{
			Addr:              address,
			Handler:           mux,
			ReadTimeout:       5 * time.Second,
			WriteTimeout:      5 * time.Second,
			ReadHeaderTimeout: 5 * time.Second,
			IdleTimeout:       5 * time.Second,
		},
	}
}

func (s *Server) Start(ctx context.Context) error {
	if err := s.database.Connect(ctx); err != nil {
		return fmt.Errorf("error connecting to database: %w", err)
	}

	err := s.database.MigrateUp()
	if err != nil {
		return fmt.Errorf("failed to run up migration: %w", err)
	}

	err = s.blobStorage.Connect(ctx, s.log)
	if err != nil {
		return fmt.Errorf("failed to connect to s3 client: %w", err)
	}

	s.SetupRoutes()

	s.log.Info("Starting server", zap.String("address", s.address))

	if err := s.server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return err
	}

	return nil
}

func (s *Server) Stop() error {
	s.log.Info("Stopping server")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := s.server.Shutdown(ctx); err != nil {
		return fmt.Errorf("error stopping server: %w", err)
	}

	return nil
}
