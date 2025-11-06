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

	Exif struct {
		CameraMake   string `json:"cameraMake"`
		CameraModel  string `json:"cameraModel"`
		LensMake     string `json:"lensMake"`
		LensModel    string `json:"lensModel"`
		FocalLength  string `json:"focalLength"`
		Aperture     string `json:"aperture"`
		ShutterSpeed string `json:"shutterSpeed"`
		ISO          int    `json:"iso"`
	} `json:"exif"`

	GPS struct {
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
	} `json:"gps"`
}
