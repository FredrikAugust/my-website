package storage

import (
	"context"

	"golang.org/x/crypto/bcrypt"
)

func (db *Database) SignIn(ctx context.Context, email, password string) error {
	var storedPasswordHash []byte
	err := db.DB.DB.QueryRowContext(ctx, "SELECT password FROM \"user\" WHERE email = $1", email).Scan(&storedPasswordHash)
	if err != nil {
		return err
	}

	if err := bcrypt.CompareHashAndPassword(storedPasswordHash, []byte(password)); err != nil {
		return err
	}

	return nil
}

func HashPassword(password string) ([]byte, error) {
	return bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
}
