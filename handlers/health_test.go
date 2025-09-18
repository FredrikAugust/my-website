package handlers_test

import (
	"context"
	"errors"
	"net/http"
	"testing"
	"website/handlers"
	"website/integrationtest"

	"github.com/go-chi/chi/v5"
	"github.com/matryer/is"
)

type mockPinger struct {
	err error
}

func (m *mockPinger) Ping(ctx context.Context) error {
	return m.err
}

func TestHealth(t *testing.T) {
	t.Run("returns 200", func(t *testing.T) {
		is := is.New(t)

		mux := chi.NewMux()
		handlers.Health(mux, &mockPinger{})
		code, _, _ := integrationtest.MakeGetRequest(mux, "/health")
		is.Equal(http.StatusOK, code)
	})

	t.Run("returns 502 on broken pinger", func(t *testing.T) {
		is := is.New(t)

		mux := chi.NewMux()
		handlers.Health(mux, &mockPinger{err: errors.New("broken pinger in test")})
		code, _, _ := integrationtest.MakeGetRequest(mux, "/health")
		is.Equal(http.StatusBadGateway, code)
	})
}
