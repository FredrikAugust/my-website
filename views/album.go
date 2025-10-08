package views

import (
	"website/model"
	"website/views/route"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	h "maragu.dev/gomponents/html"
)

func Album(albumID int, photos []model.Photo, authenticated bool) g.Node {
	return Page("Album", route.Album(albumID),
		authenticated,
		h.Div(c.Classes{"grid grid-cols-1 gap-2 md:grid-cols-2 2xl:grid-cols-3": true}, g.Map(photos, func(photo model.Photo) g.Node {
			return h.Img(c.Classes{"w-full h-full object-cover": true}, h.Src(photo.URL), h.Loading("lazy"))
		})),
	)
}
