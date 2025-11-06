package views

import (
	"time"
	"website/model"
	"website/views/route"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	h "maragu.dev/gomponents/html"
)

func formatDate(dateStr string) string {
	if dateStr == "" {
		return ""
	}

	t, err := time.Parse(time.RFC3339, dateStr)
	if err != nil {
		// Try alternative format without timezone
		t, err = time.Parse("2006-01-02", dateStr)
		if err != nil {
			return dateStr // Return original if parsing fails
		}
	}

	return t.Format("January 2, 2006 15:04")
}

func Album(albumID int, album model.AlbumWithPhotos, authenticated bool) g.Node {
	return Page("Album", route.Album(albumID),
		authenticated,
		h.Div(
			c.Classes{"flex flex-col gap-2": true},
			h.A(g.Text("← Back to all albums"), h.Href(route.Albums), h.Class("text-sm text-blue-700 hover:underline")),
			h.Div(
				h.H1(h.Class("text-xl font-semibold"), g.Text(album.Name)),
				g.If(album.Description != "", h.P(g.Text(album.Description))),
			),
			h.Div(
				c.Classes{"flex flex-col gap-1": true},
				g.Map(album.Photos, func(photo model.Photo) g.Node {
					return h.Div(
						h.Class("flex flex-col md:flex-row gap-2"),
						h.A(h.Target("_blank"), h.Rel("noreferer"), h.Href(photo.Sizes.Large.URL), h.Img(c.Classes{"w-full h-auto object-cover cursor-zoom-in": true}, h.Src(photo.Sizes.Small.URL), h.Loading("lazy"))),
						h.Div(
							h.Class("flex flex-col gap-1 text-sm"),
							h.Div(
								h.H3(h.Class("text-lg font-semibold"), g.Text(photo.Alt)),
								g.If(photo.Description != "", h.P(h.Class("text-gray-600"), g.Text(photo.Description))),
							),
							g.If(photo.TakenAt != "" || photo.Location != "",
								h.Div(
									h.Class("text-gray-500"),
									g.If(photo.TakenAt != "", h.Div(g.Text(formatDate(photo.TakenAt)))),
									g.If(photo.Location != "", h.Div(g.Text(photo.Location))),
								),
							),
							g.If(photo.Exif.CameraMake != "" || photo.Exif.CameraModel != "" || photo.Exif.LensMake != "" || photo.Exif.LensModel != "",
								h.Div(
									h.Class("text-gray-600"),
									g.If(photo.Exif.CameraMake != "" || photo.Exif.CameraModel != "",
										h.Div(
											g.If(photo.Exif.CameraMake != "" && photo.Exif.CameraModel != "", g.Text(photo.Exif.CameraMake+" "+photo.Exif.CameraModel)),
											g.If(photo.Exif.CameraMake != "" && photo.Exif.CameraModel == "", g.Text(photo.Exif.CameraMake)),
											g.If(photo.Exif.CameraMake == "" && photo.Exif.CameraModel != "", g.Text(photo.Exif.CameraModel)),
										),
									),
									g.If(photo.Exif.LensMake != "" || photo.Exif.LensModel != "",
										h.Div(
											g.If(photo.Exif.LensMake != "" && photo.Exif.LensModel != "", g.Text(photo.Exif.LensMake+" "+photo.Exif.LensModel)),
											g.If(photo.Exif.LensMake != "" && photo.Exif.LensModel == "", g.Text(photo.Exif.LensMake)),
											g.If(photo.Exif.LensMake == "" && photo.Exif.LensModel != "", g.Text(photo.Exif.LensModel)),
										),
									),
								),
							),
							g.If(photo.Exif.FocalLength != "" || photo.Exif.Aperture != "" || photo.Exif.ShutterSpeed != "" || photo.Exif.ISO != 0,
								h.Div(
									h.Class("text-gray-600 flex flex-wrap gap-x-3"),
									g.If(photo.Exif.FocalLength != "", h.Span(h.Title("Focal Length"), g.Text(photo.Exif.FocalLength))),
									g.If(photo.Exif.Aperture != "", h.Span(h.Title("Aperture"), g.Text(photo.Exif.Aperture))),
									g.If(photo.Exif.ShutterSpeed != "", h.Span(h.Title("Shutter Speed"), g.Text(photo.Exif.ShutterSpeed))),
									g.If(photo.Exif.ISO != 0, h.Span(h.Title("ISO"), g.Textf("ISO %d", photo.Exif.ISO))),
								),
							),
							g.If(photo.GPS.Latitude != 0 && photo.GPS.Longitude != 0,
								h.Div(
									h.Class("text-gray-500"),
									g.Textf("%.6f, %.6f", photo.GPS.Latitude, photo.GPS.Longitude),
								),
							),
						),
					)
				}),
			),
		),
	)
}
