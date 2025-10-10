package handlers_test

import (
	"context"
	"net/http"
	"strings"
	"testing"

	"website/handlers"
	"website/integrationtest"
	"website/views/route"

	"github.com/go-chi/chi/v5"
	"github.com/matryer/is"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

const (
	validPassword = "my-valid-password"
)

type authenticationServiceMock struct{}

// SignIn implements handlers.authenticationService.
func (a *authenticationServiceMock) SignIn(ctx context.Context, email string, password string) error {
	validHash, _ := bcrypt.GenerateFromPassword([]byte(validPassword), bcrypt.DefaultCost)
	return bcrypt.CompareHashAndPassword(validHash, []byte(password))
}

type sessionStoreMock struct{}

// CreateSession implements handlers.sessionStore.
func (s *sessionStoreMock) CreateSession(ctx context.Context, email string) (string, error) {
	return "session:)", nil
}

func TestSignIn(t *testing.T) {
	mux := chi.NewMux()
	a := &authenticationServiceMock{}
	s := &sessionStoreMock{}

	handlers.SignIn(mux, a, s, zap.NewNop())

	t.Run("valid password", func(t *testing.T) {
		is := is.New(t)
		code, _, _ := integrationtest.MakePostRequest(mux, route.Login, integrationtest.CreateFormHeader(), strings.NewReader("email=myemail&password="+validPassword))
		is.Equal(code, http.StatusFound)
	})
}
