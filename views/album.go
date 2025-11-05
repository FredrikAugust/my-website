package views

import (
	"website/model"
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
			h.A(g.Text("← Back to all albums"), h.Href(route.Albums), h.Class("text-sm text-blue-700 hover:underline")),
			h.Div(
				h.H1(h.Class("text-xl font-semibold"), g.Text(album.Name)),
				g.If(album.Description != "", h.P(g.Text(album.Description))),
			),
			h.Div(
				c.Classes{"flex flex-col gap-1": true},
				g.Map(album.Photos, func(photo model.Photo) g.Node {
					return h.A(h.Target("_blank"), h.Rel("noreferer"), h.Href(photo.Sizes.Large.URL), h.Img(c.Classes{"w-full h-auto object-cover cursor-zoom-in": true}, h.Src(photo.Sizes.Small.URL), h.Loading("lazy")))
				}),
			),
		),
	)
}
