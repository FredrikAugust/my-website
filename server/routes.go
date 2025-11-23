package server

import (
	"context"
	"net/http"
	"website/handlers"
	"website/instrumentation"
	"website/model"

	"github.com/go-chi/chi/v5"
)

func (s *Server) SetupRoutes() {
	// Due to a limitation in how middlewares get access to route data
	// we have to create a "new router" with .With for the middleware
	// to get access to the `Pattern` property.
	s.mux = instrumentation.InstrumentRouter(s.mux)

	// inject user email into context
	s.mux.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			email, _ := s.sessionStore.GetSessionFromRequest(r)
			userCtx := context.WithValue(r.Context(), "email", email)
			userCtx = context.WithValue(userCtx, "authenticated", email != model.Email(""))

			next.ServeHTTP(w, r.WithContext(userCtx))
		})
	})

	authenticatedMux := s.mux.Group(func(r chi.Router) {
		r.Use(func(next http.Handler) http.Handler {
			return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				email := r.Context().Value("email")
				if email == model.Email("") {
					w.WriteHeader(http.StatusForbidden)
					return
				}

				next.ServeHTTP(w, r)
			})
		})
	})

	// Static
	handlers.FileServer(s.mux)

	handlers.Health(s.mux, s.database)

	// Controllers
	handlers.PostComment(s.mux, s.database, s.emailClient, s.turnstileClient, s.log)
	handlers.DeleteComment(authenticatedMux, s.database, s.log)
	handlers.SignIn(s.mux, s.database, s.sessionStore, s.log)

	// Views
	handlers.FrontPage(s.mux, s.database, s.cmsClient, s.log, s.turnstileConfig)
	handlers.Photography(s.mux, s.cmsClient, s.log)
	handlers.Login(s.mux)
	handlers.Blog(s.mux, s.cmsClient, s.log)

	// Atom feed
	handlers.Feeds(s.mux, s.cmsClient, s.log)
}
