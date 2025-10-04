package views

import (
	"website/model"
	"website/views/route"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	. "maragu.dev/gomponents/html"

	"github.com/SerhiiCho/timeago/v3"
)

func FrontPage(comments []model.GuestbookEntry) g.Node {
	return Page(
		"Fredrik",
		route.Root,
		H1(c.Classes{
			"text-4xl leading-[1.3] font-bold font-display text-transparent bg-clip-text bg-contain bg-[url('/static/images/sparkles.gif')]": true,
		}, g.Text("Fredrik's Homepage")),
		Div(
			c.Classes{
				"text-gray-800 text-sm": true,
			},
			P(g.Text("Here you can read about my experiments and experiences with various technologies, and look at my photos.")),
			P(g.Text("I hope you enjoy your visit. Please leave a message in the guestbook if you did.")),
		),
		Div(
			c.Classes{"flex flex-col": true},
			Img(c.Classes{"w-30": true}, Src("/static/images/guestbook.gif"), Alt("an old man writing in a guestbook")),
			Div(
				c.Classes{
					"flex flex-col border border-gray-300 px-2 py-1 gap-1 h-80 overflow-y-auto": true,
				},

				g.Map(comments, func(comment model.GuestbookEntry) g.Node {
					timeAgo, err := timeago.Parse(comment.CreatedAt)
					if err != nil {
						timeAgo = "Unknown"
					}
					return Div(c.Classes{"flex flex-col items-start text-sm whitespace-nowrap flex-wrap": true},
						Div(c.Classes{"flex gap-1 items-center": true}, Span(c.Classes{"font-bold": true}, g.Text(comment.Name)), Span(c.Classes{"text-xs text-gray-600": true}, g.Text(timeAgo))),
						Span(c.Classes{"whitespace-break-spaces": true}, g.Text(comment.Message)),
					)
				}),
			),
		),
		FormEl(
			c.Classes{
				"text-sm": true,
			},
			Action(route.Guestbook),
			Method("POST"),
			Div(
				c.Classes{
					"flex flex-col gap-1": true,
				},
				Input(
					c.Classes{"border bg-white border-gray-300 px-2 py-1": true},
					Name("name"),
					Placeholder("Your name"),
					AutoComplete("given-name"),
					Required(),
					MinLength("1"),
					MaxLength("100"),
				),
				Textarea(
					c.Classes{"border bg-white border-gray-300 px-2 py-1": true},
					Name("comment"),
					Placeholder("Comment"),
					Required(),
					MinLength("1"),
					MaxLength("1000"),
				),
				Button(c.Classes{"font-sans self-start bg-gray-800 text-white px-2 py-1": true}, Type("submit"), g.Text("Post comment")),
			),
		),
	)
}
