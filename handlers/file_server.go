package handlers

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/go-chi/chi/v5"
)

func FileServer(mux chi.Router) {
	staticDir := getStaticDir()
	mux.Handle("/static/*", http.StripPrefix("/static", http.FileServer(http.Dir(staticDir))))
}

func getStaticDir() string {
	// Try current directory first (for production)
	if _, err := os.Stat("./static"); err == nil {
		return "./static"
	}

	// Try parent directory (for tests running from handlers dir)
	if _, err := os.Stat("../static"); err == nil {
		return "../static"
	}

	// Try absolute path based on current working directory
	wd, _ := os.Getwd()
	staticPath := filepath.Join(wd, "static")
	if _, err := os.Stat(staticPath); err == nil {
		return staticPath
	}

	// Fallback to current directory
	return "./static"
}
