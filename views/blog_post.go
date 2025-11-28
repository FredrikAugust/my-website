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

	return Page(PageOptions{
		Title:         post.Title,
		Description:   post.Excerpt,
		Path:          route.BlogPost(post.Slug),
		Authenticated: authenticated,
		Body: []g.Node{h.Section(
			h.Class("flex flex-col gap-2 overflow-x-hidden [&_a]:!text-black [&_a]:underline [&_a]:!font-serif"),
			h.A(g.Text("← Back to all blog posts"), h.Href(route.Blog), h.Class("text-sm")),
			h.Div(
				h.Class("flex flex-col"),
				g.Iff(post.FeaturedImage != nil, func() g.Node {
					return h.Img(h.Class("max-h-[30svh] object-contain self-start mb-2"), h.Src(post.FeaturedImage.Sizes.Large.URL))
				}),
				h.H1(h.Class("!text-4xl"), g.Text(post.Title)),
				h.Small(h.Class("mt-1"), h.Title(post.PublishedAt.String()), g.Textf("Published %v", published)),
				g.If(published != updated, h.Small(h.Title(post.UpdatedAt.String()), g.Textf("Updated %v", updated))),
				h.Hr(h.Class("mt-2")),
			),
			h.Div(
				h.Class("border-gray-500 border-l py-1 px-2 w-fit flex flex-col"),
				h.Span(h.Class("font-sans"), g.Text("Abstract")),
				h.P(h.Class("text-sm text-gray-700 max-w-full"), g.Text(post.Excerpt)),
			),
			h.Link(h.Rel("stylesheet"), h.Href("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/default.min.css")),
			h.Script(g.Text("function highlight() { hljs.highlightAll(); }")),
			h.Script(h.Src("https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"), h.Defer(), g.Attr("onload", "highlight()")),
			post.Content.RenderToGomponents(),
			h.Div(
				h.Class("mt-4"),
				h.H3(g.Text("Comments")),
				// todo
			),
		)},
	})
}
