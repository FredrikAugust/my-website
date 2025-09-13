package handlers_test

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"website/handlers"
	"website/model"

	"github.com/go-chi/chi/v5"
	"github.com/matryer/is"
)

type guestbookMock struct {
}

func (m *guestbookMock) PostComment(ctx context.Context, name model.Name, comment model.Comment) error {
	return nil
}

func TestPostComment(t *testing.T) {
	mux := chi.NewMux()
	g := &guestbookMock{}
	handlers.PostComment(mux, g)

	t.Run("posts a comment with valid name and comment", func(t *testing.T) {
		is := is.New(t)
		code, _, _ := makePostRequest(mux, "/guestbook", createFormHeader(), strings.NewReader("name=John&comment=Hello"))
		is.Equal(code, http.StatusCreated)
	})

	t.Run("rejects invalid name", func(t *testing.T) {
		is := is.New(t)
		code, _, _ := makePostRequest(mux, "/guestbook", createFormHeader(), strings.NewReader("name=&comment=Hello"))
		is.Equal(code, http.StatusBadRequest)
	})

	t.Run("rejects invalid comment", func(t *testing.T) {
		is := is.New(t)
		code, _, _ := makePostRequest(mux, "/guestbook", createFormHeader(), strings.NewReader("name=John&comment="))
		is.Equal(code, http.StatusBadRequest)
	})
}

func makePostRequest(handler http.Handler, target string, header http.Header, body io.Reader) (int, http.Header, string) {
	req := httptest.NewRequest(http.MethodPost, target, body)
	req.Header = header
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)
	result := res.Result()
	bodyBytes, err := io.ReadAll(result.Body)
	if err != nil {
		panic(err)
	}
	return result.StatusCode, result.Header, string(bodyBytes)
}

func createFormHeader() http.Header {
	header := http.Header{}
	header.Set("Content-Type", "application/x-www-form-urlencoded")
	return header
}
