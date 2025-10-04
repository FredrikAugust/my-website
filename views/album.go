package views

import (
	"website/model"
	"website/views/route"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	. "maragu.dev/gomponents/html"
)

func Album(albumId int, photos []model.Photo, authenticated bool) g.Node {
	return Page("Album", route.Album(albumId),
		authenticated,
		Div(c.Classes{"grid grid-cols-1 gap-2 md:grid-cols-2 2xl:grid-cols-3": true}, g.Map(photos, func(photo model.Photo) g.Node {
			return Img(c.Classes{"w-full h-full object-cover": true}, Src(photo.URL), Loading("lazy"))
		})),
	)
}
