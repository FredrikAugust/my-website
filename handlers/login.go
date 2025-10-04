package handlers

import (
	"context"
	"net/http"
	"website/views/route"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type sessionStore interface {
	CreateSession(email string) (string, error)
}

type authenticationService interface {
	SignIn(ctx context.Context, email, password string) error
}

func SignIn(mux chi.Router, a authenticationService, s sessionStore, logger *zap.Logger) {
	mux.Post(route.Login, func(w http.ResponseWriter, r *http.Request) {
		email := r.FormValue("email")
		password := r.FormValue("password")

		if len(email) == 0 || len(password) == 0 {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		if err := a.SignIn(r.Context(), email, password); err != nil {
			logger.Warn("user failed authentication", zap.String("email", email))
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		sessionID, err := s.CreateSession(email)
		if err != nil {
			logger.Error("failed to create session id for user", zap.String("email", email))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Set-Cookie", "session="+sessionID)

		logger.Info("successfully signed in", zap.String("email", email))

		http.Redirect(w, r, route.Root, http.StatusFound)
	})
}
