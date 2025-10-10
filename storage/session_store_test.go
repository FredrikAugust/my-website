package storage_test

import (
	"errors"
	"testing"

	"website/storage"

	"github.com/google/uuid"
	"github.com/matryer/is"
)

func TestSessionStore(t *testing.T) {
	t.Run("create session", func(t *testing.T) {
		is := is.New(t)
		sessionStore := storage.NewInMemorySessionStore()
		_, err := sessionStore.CreateSession(t.Context(), "fredrik@example.com")
		is.NoErr(err)
	})

	t.Run("get session (non-existent)", func(t *testing.T) {
		is := is.New(t)
		sessionStore := storage.NewInMemorySessionStore()
		_, err := sessionStore.GetSession(t.Context(), uuid.New().String())
		is.True(errors.Is(err, storage.ErrorNoSessionFound))
	})

	t.Run("get session (not uuid)", func(t *testing.T) {
		is := is.New(t)
		sessionStore := storage.NewInMemorySessionStore()
		_, err := sessionStore.GetSession(t.Context(), "not a uuid")
		is.True(errors.Is(err, storage.ErrorInvalidUUID))
	})

	t.Run("get session (existent)", func(t *testing.T) {
		is := is.New(t)
		sessionStore := storage.NewInMemorySessionStore()
		sessionID, _ := sessionStore.CreateSession(t.Context(), "fredrik@example.com")
		email, err := sessionStore.GetSession(t.Context(), sessionID)
		is.True(err == nil)
		is.Equal(string(email), "fredrik@example.com")
	})
}
