package container

import (
	"database/sql"
	"log"
	"net/http"
	
	"github.com/fredrikaugust/website/internal/application/usecases"
	"github.com/fredrikaugust/website/internal/infrastructure/database"
	"github.com/fredrikaugust/website/internal/infrastructure/web"
)

type Container struct {
	db          *sql.DB
	viewUsecase *usecases.ViewUsecase
	handlers    *web.Handlers
}

func NewContainer() (*Container, error) {
	container := &Container{}
	
	if err := container.initDatabase(); err != nil {
		return nil, err
	}
	
	container.initServices()
	container.initHandlers()
	
	return container, nil
}

func (c *Container) initDatabase() error {
	db, err := database.ConnectDB()
	if err != nil {
		return err
	}
	
	c.db = db
	return nil
}

func (c *Container) initServices() {
	viewRepo := database.NewPostgresViewRepository(c.db)
	c.viewUsecase = usecases.NewViewUsecase(viewRepo)
}

func (c *Container) initHandlers() {
	c.handlers = web.NewHandlers(c.viewUsecase)
}

func (c *Container) GetHandler() *http.ServeMux {
	return c.handlers.SetupRoutes()
}

func (c *Container) Close() {
	if c.db != nil {
		if err := c.db.Close(); err != nil {
			log.Printf("Error closing database: %v", err)
		}
	}
}