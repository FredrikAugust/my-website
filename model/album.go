package model

type Album struct {
	AlbumID int    `db:"album_id"`
	Name    string `db:"name"`
}
