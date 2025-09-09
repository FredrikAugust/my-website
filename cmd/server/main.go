package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	
	"github.com/fredrikaugust/website/internal/application/container"
)

func main() {
	c, err := container.NewContainer()
	if err != nil {
		log.Fatal("Failed to initialize container:", err)
	}
	defer c.Close()

	handler := c.GetHandler()
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	port = ":" + port
	
	log.Printf("Server starting on port %s", port)
	
	server := &http.Server{
		Addr:    port,
		Handler: handler,
	}
	
	// Setup graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan
		
		log.Println("Shutting down server...")
		server.Close()
	}()
	
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal("Server failed to start:", err)
	}
	
	log.Println("Server stopped")
}