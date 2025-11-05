package model

type Photo struct {
	ID          int    `json:"id"`
	Alt         string `json:"alt"`
	Description string `json:"description"`
	TakenAt     string `json:"taken_at"`
	Location    string `json:"location"`

	Sizes struct {
		Small struct {
			URL string `json:"url"`
		} `json:"small"`
		Large struct {
			URL string `json:"url"`
		} `json:"large"`
	} `json:"sizes"`
}
