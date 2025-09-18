package storage

import (
	"context"
	"website/model"
)

func (db *Database) GetPhotos(ctx context.Context) ([]model.Photo, error) {
	query := `SELECT * FROM photo`

	var photos []model.Photo
	err := db.DB.SelectContext(ctx, &photos, query)
	if err != nil {
		return nil, err
	}

	return photos, nil
}
