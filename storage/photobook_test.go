package storage_test

import (
	"testing"
	"website/integrationtest"

	"github.com/matryer/is"
)

func TestDatabase_GetAlbums(t *testing.T) {
	integrationtest.SkipIfShort(t)

	t.Run("get albums", func(t *testing.T) {
		is := is.New(t)
		db, cleanup := integrationtest.CreateDatabase()
		defer cleanup()

		albums, err := db.GetAlbums(t.Context())
		is.NoErr(err)
		is.Equal(len(albums), 1) // because we seed with one during migration
	})
}
