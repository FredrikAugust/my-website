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
		sessionStore := storage.NewSessionStore()
		_, err := sessionStore.CreateSession("fredrik@example.com")
		is.NoErr(err)
	})

	t.Run("get session (non-existent)", func(t *testing.T) {
		is := is.New(t)
		sessionStore := storage.NewSessionStore()
		_, err := sessionStore.GetSession(uuid.New().String())
		is.True(errors.Is(err, storage.ErrorNoSessionFound))
	})

	t.Run("get session (not uuid)", func(t *testing.T) {
		is := is.New(t)
		sessionStore := storage.NewSessionStore()
		_, err := sessionStore.GetSession("not a uuid")
		is.True(errors.Is(err, storage.ErrorInvalidUUID))
	})

	t.Run("get session (existent)", func(t *testing.T) {
		is := is.New(t)
		sessionStore := storage.NewSessionStore()
		sessionID, _ := sessionStore.CreateSession("fredrik@example.com")
		email, err := sessionStore.GetSession(sessionID)
		is.True(err == nil)
		is.Equal(string(email), "fredrik@example.com")
	})
}
