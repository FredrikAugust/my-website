package storage_test

import (
	"testing"

	"website/integrationtest"
	"website/model"

	"github.com/matryer/is"
)

func TestDatabase_PostComment(t *testing.T) {
	integrationtest.SkipIfShort(t)

	t.Run("posts a comment", func(t *testing.T) {
		is := is.New(t)
		db, cleanup := integrationtest.CreateDatabase(t.Context())
		defer cleanup()

		err := db.PostComment(t.Context(), model.Name("Fredrik"), model.Comment("hello world"))
		is.NoErr(err)

		var message string
		err = db.QueryRowContext(t.Context(), "SELECT message FROM guestbook WHERE comment_id = 1").Scan(&message)
		is.NoErr(err)
		is.Equal(message, "hello world")
	})

	t.Run("get comments", func(t *testing.T) {
		is := is.New(t)
		db, cleanup := integrationtest.CreateDatabase(t.Context())
		defer cleanup()

		comments, err := db.GetComments(t.Context())
		is.NoErr(err)
		is.Equal(len(comments), 0)

		_ = db.PostComment(t.Context(), model.Name("fred"), model.Comment("this is just a test"))

		comments, err = db.GetComments(t.Context())
		is.NoErr(err)
		is.Equal(len(comments), 1)
		is.Equal(comments[0].Message, "this is just a test")
	})
}
