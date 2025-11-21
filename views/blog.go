package views

import (
	"website/model"
	"website/views/route"

	g "maragu.dev/gomponents"
	h "maragu.dev/gomponents/html"
)

func Blog(authenticated bool, blogPosts []model.BlogPost) g.Node {
	return Page(PageOptions{
		Title:         "Blog",
		Path:          route.Blog,
		Authenticated: authenticated,
		Body: []g.Node{h.Section(
			h.H1(g.Text("Blog posts")),
			g.Map(blogPosts, func(bp model.BlogPost) g.Node {
				return h.Div(
					h.A(h.Href(route.BlogPost(bp.Slug)), g.Text(bp.Title)),
					h.P(g.Text(bp.Excerpt)),
				)
			}),
		)},
	})
}
