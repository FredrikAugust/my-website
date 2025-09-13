package storage

import (
	"context"
	"website/model"
)

func (db *Database) PostComment(ctx context.Context, name model.Name, comment model.Comment) error {
	query := `INSERT INTO guestbook (name, message, created_at)
	VALUES ($1, $2, now())`

	_, err := db.DB.ExecContext(ctx, query, name.String(), comment.String())

	return err
}

func (db *Database) GetComments(ctx context.Context) ([]model.GuestbookEntry, error) {
	query := `SELECT name, message, created_at FROM guestbook ORDER BY created_at DESC LIMIT 100`

	var entries []model.GuestbookEntry
	err := db.DB.SelectContext(ctx, &entries, query)
	if err != nil {
		return nil, err
	}

	return entries, nil
}
