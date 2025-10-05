package server

import (
	"website/handlers"
	"website/instrumentation"
)

func (s *Server) SetupRoutes() {
	// Due to a limitation in how middlewares get access to route data
	// we have to create a "new router" with .With for the middleware
	// to get access to the `Pattern` property.
	s.mux = instrumentation.InstrumentRouter(s.mux)

	// Static
	handlers.FileServer(s.mux)

	handlers.Health(s.mux, s.database)

	// Controllers
	handlers.PostComment(s.mux, s.database, s.emailClient, s.log)
	handlers.DeleteComment(s.mux, s.database, s.sessionStore, s.log)
	handlers.SignIn(s.mux, s.database, s.sessionStore, s.log)

	// Views
	handlers.FrontPage(s.mux, s.database, s.sessionStore, s.log)
	handlers.Photography(s.mux, s.database, s.sessionStore, s.log)
	handlers.Login(s.mux, s.sessionStore)
}
