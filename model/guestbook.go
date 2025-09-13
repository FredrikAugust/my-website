package model

import "time"

type GuestbookEntry struct {
	Name      string    `db:"name"`
	Message   string    `db:"message"`
	CreatedAt time.Time `db:"created_at"`
}
