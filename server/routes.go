package server

import "website/handlers"

func (s *Server) SetupRoutes() {
	handlers.Health(s.mux, s.database)

	handlers.FrontPage(s.mux, s.database)
	handlers.PostComment(s.mux, s.database)
}
