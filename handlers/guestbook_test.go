package handlers_test

import (
	"context"
	"net/http"
	"strings"
	"testing"
	"website/handlers"
	"website/integrationtest"
	"website/model"

	"github.com/go-chi/chi/v5"
	"github.com/matryer/is"
	"go.uber.org/zap"
)

type guestbookMock struct {
}

type emailClientMock struct {
}

func (m *guestbookMock) PostComment(ctx context.Context, name model.Name, comment model.Comment) error {
	return nil
}

func (m *emailClientMock) SendEmail(ctx context.Context, from, subject, body string) error {
	return nil
}

func TestPostComment(t *testing.T) {
	mux := chi.NewMux()
	g := &guestbookMock{}
	e := &emailClientMock{}

	handlers.PostComment(mux, g, e, zap.NewNop())

	t.Run("posts a comment with valid name and comment", func(t *testing.T) {
		is := is.New(t)
		code, _, _ := integrationtest.MakePostRequest(mux, "/guestbook", integrationtest.CreateFormHeader(), strings.NewReader("name=John&comment=Hello"))
		is.Equal(code, http.StatusFound)
	})

	t.Run("rejects invalid name", func(t *testing.T) {
		is := is.New(t)
		code, _, _ := integrationtest.MakePostRequest(mux, "/guestbook", integrationtest.CreateFormHeader(), strings.NewReader("name=&comment=Hello"))
		is.Equal(code, http.StatusBadRequest)
	})

	t.Run("rejects invalid comment", func(t *testing.T) {
		is := is.New(t)
		code, _, _ := integrationtest.MakePostRequest(mux, "/guestbook", integrationtest.CreateFormHeader(), strings.NewReader("name=John&comment="))
		is.Equal(code, http.StatusBadRequest)
	})
}
