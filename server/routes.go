package server

import "website/handlers"

func (s *Server) SetupRoutes() {
	handlers.Health(s.mux)

	handlers.FrontPage(s.mux)
}
