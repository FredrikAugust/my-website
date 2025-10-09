package handlers_test

import (
	"context"
	"net/http"
	"strings"
	"testing"

	"website/handlers"
	"website/integrationtest"
	"website/model"
	"website/views/route"

	"github.com/go-chi/chi/v5"
	"github.com/matryer/is"
	"go.uber.org/zap"
)

type (
	requestSessionStoreMock struct{}
	albumCreatorMock        struct{}
)

// CreateAlbum implements handlers.albumCreator.
func (a *albumCreatorMock) CreateAlbum(ctx context.Context, albumName string) error {
	return nil
}

// GetSessionFromRequest implements handlers.requestSessionStore.
func (*requestSessionStoreMock) GetSessionFromRequest(r *http.Request) (model.Email, error) {
	return model.Email("ok"), nil
}

func TestAlbums_Create(t *testing.T) {
	t.Run("invalid name", func(t *testing.T) {
		is := is.New(t)

		mux := chi.NewMux()
		handlers.CreateAlbum(mux, &requestSessionStoreMock{}, &albumCreatorMock{}, zap.NewNop())
		code, _, _ := integrationtest.MakePostRequest(mux, route.Albums, integrationtest.CreateFormHeader(), strings.NewReader("name="))
		is.Equal(http.StatusBadRequest, code)
	})

	t.Run("valid", func(t *testing.T) {
		is := is.New(t)

		mux := chi.NewMux()
		handlers.CreateAlbum(mux, &requestSessionStoreMock{}, &albumCreatorMock{}, zap.NewNop())
		code, _, _ := integrationtest.MakePostRequest(mux, route.Albums, integrationtest.CreateFormHeader(), strings.NewReader("name=new-album"))
		is.Equal(http.StatusFound, code)
	})
}
