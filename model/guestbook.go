package model

import "time"

type GuestbookEntry struct {
	CommentID int       `db:"comment_id"`
	Name      string    `db:"name"`
	Message   string    `db:"message"`
	CreatedAt time.Time `db:"created_at"`
}
