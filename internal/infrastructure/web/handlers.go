package web

import (
	"html/template"
	"log"
	"net/http"
	
	"github.com/fredrikaugust/website/internal/application/usecases"
)

type ViewUsecaseInterface interface {
	GetPageData() (*usecases.PageData, error)
}

type Handlers struct {
	viewUsecase ViewUsecaseInterface
}

func NewHandlers(viewUsecase ViewUsecaseInterface) *Handlers {
	return &Handlers{
		viewUsecase: viewUsecase,
	}
}

func (h *Handlers) HomeHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/index.html")
	if err != nil {
		http.Error(w, "Template not found", http.StatusInternalServerError)
		log.Printf("Template parsing error: %v", err)
		return
	}

	data, err := h.viewUsecase.GetPageData()
	if err != nil {
		http.Error(w, "Failed to get page data", http.StatusInternalServerError)
		log.Printf("Failed to get page data: %v", err)
		return
	}

	err = tmpl.Execute(w, data)
	if err != nil {
		http.Error(w, "Template execution error", http.StatusInternalServerError)
		log.Printf("Template execution error: %v", err)
	}
}

func (h *Handlers) RobotsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
}

func (h *Handlers) SetupRoutes() *http.ServeMux {
	mux := http.NewServeMux()
	
	mux.HandleFunc("/", h.HomeHandler)
	mux.HandleFunc("/robots.txt", h.RobotsHandler)
	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	
	return mux
}