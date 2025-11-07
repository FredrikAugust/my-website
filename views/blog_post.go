package views

import (
	"website/model"
	"website/views/route"

	"github.com/SerhiiCho/timeago/v3"
	g "maragu.dev/gomponents"
	h "maragu.dev/gomponents/html"
)

func BlogPost(authenticated bool, post model.BlogPost) g.Node {
	published, err := timeago.Parse(post.PublishedAt)
	if err != nil {
		published = "Unknown"
	}
	updated, err := timeago.Parse(post.UpdatedAt)
	if err != nil {
		updated = "Unknown"
	}

	return Page(
		"Blog",
		route.BlogPost(post.Slug),
		authenticated,
		h.Section(
			h.Class("flex flex-col gap-2 overflow-x-hidden [&_a]:!text-black [&_a]:underline [&_a]:!font-serif"),
			h.A(g.Text("← Back to all blog posts"), h.Href(route.Blog), h.Class("text-sm")),
			h.Div(
				h.Class("flex flex-col"),
				h.H1(h.Class("!text-4xl"), g.Text(post.Title)),
				h.Small(h.Title(post.PublishedAt.String()), g.Textf("Published %v", published)),
				g.If(published != updated, h.Small(h.Title(post.UpdatedAt.String()), g.Textf("Updated %v", updated))),
				h.Hr(),
			),
			post.Content.RenderToGomponents(),
		),
	)
}
