package views

import (
	"time"
	"website/model"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	. "maragu.dev/gomponents/html"
)

func FrontPage(comments []model.GuestbookEntry) g.Node {
	return Page(
		"Fredrik",
		"/",
		H1(c.Classes{
			"text-xl": true,
		}, g.Text("Fredrik A. Madsen-Malmo's homepage")),
		Div(
			c.Classes{
				"max-w-prose text-gray-700 text-sm": true,
			},
			P(g.Text("Here you can read about my experiments and experiences with various technologies, and look at my photos.")),
			P(g.Text("I hope you enjoy your visit. Please leave a message in the guestbook if you did.")),
		),
		g.If(len(comments) > 0,
			g.Group{
				H1(g.Text("Guestbook")),
				Div(
					c.Classes{
						"flex flex-col border border-gray-300 max-w-prose px-2 py-1 gap-1": true,
					},
					g.Map(comments, func(comment model.GuestbookEntry) g.Node {
						return Div(c.Classes{"flex items-center text-sm gap-2 whitespace-nowrap flex-wrap": true},
							Span(c.Classes{"font-medium": true}, g.Text(comment.Name)),
							Span(c.Classes{"whitespace-break-spaces": true}, g.Text(comment.Message)),
							Span(c.Classes{"ml-auto text-xs text-gray-500": true}, g.Text(comment.CreatedAt.Format(time.RFC1123))),
						)
					}),
				),
			},
		),
		FormEl(
			c.Classes{
				"max-w-xs text-sm": true,
			},
			Action("/guestbook"),
			Method("POST"),
			Div(
				c.Classes{
					"flex flex-col gap-1": true,
				},
				Input(c.Classes{"px-2 py-1": true}, Name("name"), Placeholder("Your name"), AutoComplete("given-name")),
				Textarea(c.Classes{"px-2 py-1": true}, Name("comment"), Placeholder("Comment")),
				Button(c.Classes{"self-start bg-blue-600 text-white px-2 py-1": true}, Type("submit"), g.Text("Post comment")),
			),
		),
	)
}
