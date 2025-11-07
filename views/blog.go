package views

import (
	"website/model"
	"website/views/route"

	g "maragu.dev/gomponents"
	h "maragu.dev/gomponents/html"
)

func Blog(authenticated bool, blogPosts []model.BlogPost) g.Node {
	return Page(
		"Blog",
		route.Blog,
		authenticated,
		h.Section(
			h.H1(g.Text("Blog posts")),
			g.Map(blogPosts, func(bp model.BlogPost) g.Node {
				return h.Div(
					h.A(g.Text(bp.Title)),
					h.P(h.Class("max-w-prose"), g.Text(bp.Excerpt)),
				)
			}),
		),
	)
}
