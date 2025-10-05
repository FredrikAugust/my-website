package storage_test

import (
	"database/sql"
	"errors"
	"testing"
	"website/integrationtest"
	"website/storage"

	"github.com/matryer/is"
	"golang.org/x/crypto/bcrypt"
)

const (
	email    = "test@example.com"
	password = "my-new-password"
)

func TestDatabase_SignIn(t *testing.T) {
	integrationtest.SkipIfShort(t)

	t.Run("non-existent user", func(t *testing.T) {
		is := is.New(t)
		db, cleanup := integrationtest.CreateDatabase()
		defer cleanup()

		err := db.SignIn(t.Context(), email, password)
		is.True(errors.Is(err, sql.ErrNoRows))
	})

	t.Run("wrong password", func(t *testing.T) {
		is := is.New(t)
		db, cleanup := integrationtest.CreateDatabase()
		defer cleanup()

		passwordHash, _ := storage.HashPassword(password)
		_, err := db.ExecContext(t.Context(), "INSERT INTO \"user\" (email, password) VALUES ($1, $2)", email, passwordHash)
		is.NoErr(err)

		err = db.SignIn(t.Context(), email, "wrong-password")

		is.True(errors.Is(err, bcrypt.ErrMismatchedHashAndPassword))
	})

	t.Run("correct password", func(t *testing.T) {
		is := is.New(t)
		db, cleanup := integrationtest.CreateDatabase()
		defer cleanup()

		passwordHash, _ := storage.HashPassword(password)
		_, err := db.ExecContext(t.Context(), "INSERT INTO \"user\" (email, password) VALUES ($1, $2)", email, passwordHash)
		is.NoErr(err)

		err = db.SignIn(t.Context(), email, password)

		is.NoErr(err)
	})
}
