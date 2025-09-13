package server

import (
	"net/http"
	"website/handlers"

	"go.uber.org/zap"
)

func (s *Server) SetupRoutes() {
	s.mux.Use(loggerMiddleware(s.log))

	handlers.Health(s.mux, s.database)

	handlers.FrontPage(s.mux, s.database, s.log)
	handlers.PostComment(s.mux, s.database, s.log)
}

func loggerMiddleware(log *zap.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path != "/health" {
				log.Info("request received", zap.String("method", r.Method), zap.String("path", r.URL.Path))
			}
			next.ServeHTTP(w, r)
		})
	}
}
