package views

import (
	"website/model"
	"website/views/route"

	"github.com/SerhiiCho/timeago/v3"
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
			h.Div(
				h.Class("flex flex-col gap-2"),
				g.Map(blogPosts, func(bp model.BlogPost) g.Node {
					published, err := timeago.Parse(bp.PublishedAt)
					if err != nil {
						published = "Unknown"
					}
					return h.Div(
						h.Class("flex flex-col"),
						h.A(h.Href(route.BlogPost(bp.Slug)), g.Text(bp.Title)),
						h.P(g.Text(bp.Excerpt)),
						h.Small(g.Text(published)),
					)
				}),
			),
		)},
	})
}
