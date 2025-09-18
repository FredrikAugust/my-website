package model

type Photo struct {
	PhotoID int    `db:"photo_id"`
	URL     string `db:"url"`
}
