package main

import (
	"html/template"
	"log"
	"net/http"
	"os"
	"sync/atomic"
	"time"
)

var visitorCount int64

type PageData struct {
	DateTime string
	VisitorNumber int64
	Hostname string
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("templates/index.html")
	if err != nil {
		http.Error(w, "Template not found", http.StatusInternalServerError)
		log.Printf("Template parsing error: %v", err)
		return
	}

	currentVisitor := atomic.AddInt64(&visitorCount, 1)
	
	hostname, err := os.Hostname()
	if err != nil {
		hostname = "unknown"
	}

	data := PageData{
		DateTime:      time.Now().Format("Jan 2nd, 2006 15:04"),
		VisitorNumber: currentVisitor,
		Hostname:      hostname,
	}

	err = tmpl.Execute(w, data)
	if err != nil {
		http.Error(w, "Template execution error", http.StatusInternalServerError)
		log.Printf("Template execution error: %v", err)
	}
}

func robotsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
}

func main() {
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/robots.txt", robotsHandler)
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	port = ":" + port
	
	log.Printf("Server starting on port %s", port)
	
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}