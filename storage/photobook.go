package storage

import (
	"context"
	"website/model"
)

func (db *Database) GetAlbums(ctx context.Context) ([]model.Album, error) {
	query := `SELECT * FROM album`

	var albums []model.Album
	err := db.SelectContext(ctx, &albums, query)
	if err != nil {
		return nil, err
	}

	return albums, nil
}

func (db *Database) GetPhotos(ctx context.Context, albumID int) ([]model.Photo, error) {
	query := `SELECT photo_id, url FROM photo WHERE album_id = $1`

	var photos []model.Photo
	err := db.SelectContext(ctx, &photos, query, albumID)
	if err != nil {
		return nil, err
	}

	return photos, nil
}
