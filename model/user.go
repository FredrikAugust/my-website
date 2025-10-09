package model

import "time"

type (
	Email        string
	PasswordHash string
)

type User struct {
	Email     Email        `db:"email"`
	Password  PasswordHash `db:"password"`
	CreatedAt time.Time    `db:"created_at"`
	UpdatedAt time.Time    `db:"updated_at"`
}
