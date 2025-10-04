package handlers_test

import (
	"context"
	"errors"
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

type guestbookMock struct {
}

type emailClientMock struct {
}

// GetSessionFromRequest implements handlers.requestSessionStore.
func (s *sessionStoreMock) GetSessionFromRequest(r *http.Request) (model.Email, error) {
	session, err := r.Cookie("session")
	if err != nil {
		return model.Email(""), err
	}

	if session.Value == "pass" {
		return model.Email("email"), nil
	}

	return model.Email(""), errors.New("no session")
}

// DeleteComment implements handlers.guestbook.
func (m *guestbookMock) DeleteComment(ctx context.Context, commentID int) error {
	return nil
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
		code, _, _ := integrationtest.MakePostRequest(mux, route.Guestbook, integrationtest.CreateFormHeader(), strings.NewReader("name=John&comment=Hello"))
		is.Equal(code, http.StatusFound)
	})

	t.Run("rejects invalid name", func(t *testing.T) {
		is := is.New(t)
		code, _, _ := integrationtest.MakePostRequest(mux, route.Guestbook, integrationtest.CreateFormHeader(), strings.NewReader("name=&comment=Hello"))
		is.Equal(code, http.StatusBadRequest)
	})

	t.Run("rejects invalid comment", func(t *testing.T) {
		is := is.New(t)
		code, _, _ := integrationtest.MakePostRequest(mux, route.Guestbook, integrationtest.CreateFormHeader(), strings.NewReader("name=John&comment="))
		is.Equal(code, http.StatusBadRequest)
	})
}

func TestDeleteComment(t *testing.T) {
	mux := chi.NewMux()
	g := &guestbookMock{}
	ssm := &sessionStoreMock{}

	handlers.DeleteComment(mux, g, ssm, zap.NewNop())

	t.Run("invalid comment id", func(t *testing.T) {
		is := is.New(t)
		code, _, _ := integrationtest.MakePostRequest(mux, route.GuestbookDelete, integrationtest.CreateFormHeader(), strings.NewReader("comment_id=dog"))
		is.Equal(code, http.StatusBadRequest)
	})

	t.Run("no authentication", func(t *testing.T) {
		is := is.New(t)
		header := integrationtest.CreateFormHeader()
		header.Add("Cookie", "session=fail")
		code, _, _ := integrationtest.MakePostRequest(mux, route.GuestbookDelete, header, strings.NewReader("comment_id=4"))
		is.Equal(code, http.StatusUnauthorized)
	})

	t.Run("authentication", func(t *testing.T) {
		is := is.New(t)
		header := integrationtest.CreateFormHeader()
		header.Add("Cookie", "session=pass")
		code, _, _ := integrationtest.MakePostRequest(mux, route.GuestbookDelete, header, strings.NewReader("comment_id=4"))
		is.Equal(code, http.StatusFound)
	})
}
