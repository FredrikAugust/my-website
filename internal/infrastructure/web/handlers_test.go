package web

import (
	"errors"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/fredrikaugust/website/internal/application/usecases"
)

type mockViewUsecase struct {
	pageData *usecases.PageData
	err      error
}

func (m *mockViewUsecase) GetPageData() (*usecases.PageData, error) {
	return m.pageData, m.err
}

func setupTestTemplate(t *testing.T) func() {
	// Create temporary templates directory and file for testing
	err := os.MkdirAll("templates", 0755)
	if err != nil {
		t.Fatal(err)
	}

	templateContent := `<!DOCTYPE html>
<html>
<head><title>Fredrik's Homepage</title></head>
<body>
<div class="date-line">It's {{.DateTime}} and you're visitor number {{.VisitorNumber}} to {{.Hostname}}.</div>
</body>
</html>`

	err = ioutil.WriteFile(filepath.Join("templates", "index.html"), []byte(templateContent), 0644)
	if err != nil {
		t.Fatal(err)
	}

	// Return cleanup function
	return func() {
		os.RemoveAll("templates")
	}
}

func TestHandlers_HomeHandler_Success(t *testing.T) {
	cleanup := setupTestTemplate(t)
	defer cleanup()
	mockUsecase := &mockViewUsecase{
		pageData: &usecases.PageData{
			DateTime:      time.Now().Format("Jan 2nd, 2006 15:04"),
			VisitorNumber: 42,
			Hostname:      "test-host",
		},
	}

	handlers := NewHandlers(mockUsecase)

	req, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.HomeHandler)

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	body := rr.Body.String()
	if !strings.Contains(body, "visitor number 42") {
		t.Errorf("Handler response does not contain expected visitor number, got: %s", body)
	}

	if !strings.Contains(body, "test-host") {
		t.Errorf("Handler response does not contain expected hostname, got: %s", body)
	}

	if !strings.Contains(body, "Fredrik's Homepage") {
		t.Errorf("Handler response does not contain expected title, got: %s", body)
	}
}

func TestHandlers_HomeHandler_UsecaseError(t *testing.T) {
	cleanup := setupTestTemplate(t)
	defer cleanup()
	mockUsecase := &mockViewUsecase{
		err: errors.New("usecase error"),
	}

	handlers := NewHandlers(mockUsecase)

	req, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.HomeHandler)

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusInternalServerError {
		t.Errorf("Handler returned wrong status code: got %v want %v", status, http.StatusInternalServerError)
	}

	body := rr.Body.String()
	if !strings.Contains(body, "Failed to get page data") {
		t.Errorf("Handler response does not contain expected error message, got: %s", body)
	}
}

func TestHandlers_RobotsHandler(t *testing.T) {
	mockUsecase := &mockViewUsecase{} // Not used for robots.txt
	handlers := NewHandlers(mockUsecase)

	req, err := http.NewRequest("GET", "/robots.txt", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handlers.RobotsHandler)

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	contentType := rr.Header().Get("Content-Type")
	if contentType != "text/plain" {
		t.Errorf("Handler returned wrong content type: got %v want %v", contentType, "text/plain")
	}
}

func TestHandlers_SetupRoutes(t *testing.T) {
	cleanup := setupTestTemplate(t)
	defer cleanup()
	mockUsecase := &mockViewUsecase{
		pageData: &usecases.PageData{
			DateTime:      time.Now().Format("Jan 2nd, 2006 15:04"),
			VisitorNumber: 1,
			Hostname:      "test-host",
		},
	}

	handlers := NewHandlers(mockUsecase)
	mux := handlers.SetupRoutes()

	// Test home route
	req, _ := http.NewRequest("GET", "/", nil)
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Home route returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Test robots.txt route
	req, _ = http.NewRequest("GET", "/robots.txt", nil)
	rr = httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Robots route returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	// Test static file serving (should return 404 since we don't have actual files)
	req, _ = http.NewRequest("GET", "/static/style.css", nil)
	rr = httptest.NewRecorder()
	mux.ServeHTTP(rr, req)

	// Should return 404 since the file doesn't exist, but the handler should be set up
	if status := rr.Code; status != http.StatusNotFound {
		t.Errorf("Static route should return 404 for missing file, got %v", status)
	}
}