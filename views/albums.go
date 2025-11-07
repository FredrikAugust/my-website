package views

import (
	"website/model"
	"website/views/route"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	h "maragu.dev/gomponents/html"
)

func Albums(albums []model.Album, authenticated bool) g.Node {
	return Page("Photography", route.Albums,
		authenticated,
		h.Section(
			h.H1(g.Text("Albums")),
			h.Div(c.Classes{"flex flex-col gap-2": true}, g.Map(albums, func(album model.Album) g.Node {
				return h.Div(h.Class("flex flex-col"),
					h.A(g.Text(album.Name), h.Href(route.Album(album.ID))),
					h.P(g.Text(album.Description)),
				)
			})),
		),
	)
}
