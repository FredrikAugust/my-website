package integrationtest

import (
	"context"
	"net/http"
	"testing"
	"time"

	"website/security"
	"website/server"
	"website/storage"
)

func CreateServer(ctx context.Context) func() {
	database, cleanup := CreateDatabase(ctx)
	s := server.New(server.Options{
		Host:        "localhost",
		BlobStorage: storage.NewS3(""), // we won't call connnect in test so we'll just leave it blank
		TurnstileOptions: &security.TurnstileFrontendOptions{
			Sitekey: security.AlwaysBlocksInvisibleSitekey,
		},
		Database: database,
		Port:     8081,
	})

	go func() {
		if err := s.Start(ctx); err != nil {
			panic(err)
		}
	}()

	// Wait for server to be ready
	for {
		_, err := http.Get("http://localhost:8081/")
		if err == nil {
			break
		}
		time.Sleep(5 * time.Millisecond)
	}

	return func() {
		if err := s.Stop(); err != nil {
			panic(err)
		}
		cleanup()
	}
}

// SkipIfShort skips the test if running with `-test.short` flag in `go test`
func SkipIfShort(t *testing.T) {
	if testing.Short() {
		t.SkipNow()
	}
}
