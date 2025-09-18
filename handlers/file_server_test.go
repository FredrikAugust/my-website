package handlers_test

import (
	"net/http"
	"testing"
	"website/handlers"
	"website/integrationtest"

	"github.com/go-chi/chi/v5"
	"github.com/matryer/is"
)

func TestFileServer_Serves(t *testing.T) {
	t.Run("serves static content", func(t *testing.T) {
		is := is.New(t)

		mux := chi.NewMux()
		handlers.FileServer(mux)
		code, _, _ := integrationtest.MakeGetRequest(mux, "/static/favicon.ico")
		is.Equal(http.StatusOK, code)
	})

	t.Run("fails on nonexisting", func(t *testing.T) {
		is := is.New(t)

		mux := chi.NewMux()
		handlers.FileServer(mux)
		code, _, _ := integrationtest.MakeGetRequest(mux, "/static/favicon.iconography")
		is.Equal(http.StatusNotFound, code)
	})

}
