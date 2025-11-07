package views

import (
	"website/model"
	"website/views/components"
	"website/views/route"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	h "maragu.dev/gomponents/html"
)

func Album(albumID int, album model.AlbumWithPhotos, authenticated bool) g.Node {
	return Page("Album", route.Album(albumID),
		authenticated,
		h.Div(
			c.Classes{"flex flex-col gap-2": true},
			h.A(g.Text("← Back to all albums"), h.Href(route.Albums), h.Class("text-sm")),
			h.Div(
				h.H1(g.Text(album.Name)),
				g.If(album.Description != "", h.P(g.Text(album.Description))),
			),
			h.Div(
				c.Classes{"flex flex-col gap-4": true},
				g.Map(album.Photos, components.PhotoWithDetails),
			),
		),
	)
}
