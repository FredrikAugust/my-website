package model

type Album struct {
	ID          int    `json:"id"`
	Description string `json:"description"`
	Name        string `json:"name"`
}

type AlbumWithPhotos struct {
	Album

	Photos []Photo `json:"photos"`
}
