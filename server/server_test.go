package server_test

import (
	"net/http"
	"testing"
	"website/integrationtest"

	"github.com/matryer/is"
)

func TestServer_Start(t *testing.T) {
	integrationtest.SkipIfShort(t)

	t.Run("starts the server and listens for requests", func(t *testing.T) {
		is := is.New(t)

		cleanup := integrationtest.CreateServer(t.Context())
		defer cleanup()

		resp, err := http.Get("http://localhost:8081/")
		is.NoErr(err)
		is.Equal(http.StatusOK, resp.StatusCode)
	})
}
