package views

import (
	"website/model"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	. "maragu.dev/gomponents/html"
)

func Photos(photos []model.Photo) g.Node {
	return Page("Photography", "/photos",
		Div(c.Classes{"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 md:gap-4": true}, g.Map(photos, func(photo model.Photo) g.Node {
			return Picture(c.Classes{"w-full h-auto": true}, Source(SrcSet(photo.URL), Type("image/avif")), Img(Src(photo.URL), Loading("lazy"), g.Attr("decoding", "async")))
		})),
	)
}
