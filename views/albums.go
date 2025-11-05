package views

import (
	"net/http"

	"website/model"
	"website/views/components"
	"website/views/route"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	h "maragu.dev/gomponents/html"
)

func Albums(albums []model.Album, authenticated bool) g.Node {
	return Page("Photography", route.Albums,
		authenticated,
		h.Div(
			c.Classes{
				"flex flex-col gap-1": true,
			},
			h.H2(c.Classes{"font-display text-2xl": true}, g.Text("Albums")),
			h.Div(c.Classes{"flex flex-col gap-2": true}, g.Map(albums, func(album model.Album) g.Node {
				return h.Div(h.Class("flex flex-col text-sm"),
					h.A(h.Class("text-blue-700 hover:underline"), g.Text(album.Name), h.Href(route.Album(album.ID))),
					h.P(h.Class("text-xs teext-gray-700"), g.Text(album.Description)),
				)
			})),
			g.If(authenticated, h.Form(
				h.Action(route.Albums),
				h.Method(http.MethodPost),
				h.Div(h.Class("flex gap-2 items-center mt-2 text-sm"),
					components.Input(h.Placeholder("Album name"), h.Name("name")),
					components.Button(h.Type("submit"), g.Text("Create album")),
				),
			)),
		),
	)
}
