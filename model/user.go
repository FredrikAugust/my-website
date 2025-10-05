package model

type Email string
type PasswordHash string

type User struct {
	Email     Email        `db:"email"`
	Password  PasswordHash `db:"password"`
	CreatedAt string       `db:"created_at"`
	UpdatedAt string       `db:"updated_at"`
}
