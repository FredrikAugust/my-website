package model

type Email string
type PasswordHash string

type User struct {
	email     Email
	password  PasswordHash
	createdAt string `db:"created_at"`
	updatedAt string `db:"updated_at"`
}
