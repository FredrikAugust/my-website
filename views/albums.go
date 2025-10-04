package views

import (
	"website/model"
	"website/views/route"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	. "maragu.dev/gomponents/html"
)

func Albums(albums []model.Album, authenticated bool) g.Node {
	return Page("Photography", route.Albums,
		authenticated,
		Div(
			c.Classes{
				"flex flex-col gap-1": true,
			},
			H2(c.Classes{"font-display text-2xl": true}, g.Text("Albums")),
			Div(c.Classes{"flex flex-col gap-2": true}, g.Map(albums, func(album model.Album) g.Node {
				return A(c.Classes{"text-blue-700 hover:underline text-sm": true}, g.Text(album.Name), Href(route.Album(album.AlbumID)))
			})),
		),
	)
}
