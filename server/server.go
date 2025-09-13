// Server package handles setting up and running the HTTP server
package server

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"strconv"
	"time"
	"website/storage"

	"github.com/go-chi/chi/v5"
	_ "github.com/joho/godotenv/autoload"
	"go.uber.org/zap"
)

type Server struct {
	address  string
	log      *zap.Logger
	mux      chi.Router
	server   *http.Server
	database *storage.Database
}

type Options struct {
	Database *storage.Database
	Host     string
	Log      *zap.Logger
	Port     int
}

func New(opts Options) *Server {
	if opts.Log == nil {
		opts.Log = zap.NewNop()
	}

	address := net.JoinHostPort(opts.Host, strconv.Itoa(opts.Port))
	mux := chi.NewMux()

	return &Server{
		address:  address,
		database: opts.Database,
		mux:      mux,
		log:      opts.Log,
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

func (s *Server) Start() error {
	if err := s.database.Connect(); err != nil {
		return fmt.Errorf("error connecting to database: %w", err)
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
