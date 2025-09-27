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
			"text-4xl leading-[1.3] font-bold font-[ruigslay] text-transparent bg-clip-text bg-contain bg-[url('/static/images/sparkles.gif')]": true,
		}, g.Text("Fredrik's Homepage")),
		Div(
			c.Classes{
				"max-w-prose text-gray-700 text-sm": true,
			},
			P(g.Text("Here you can read about my experiments and experiences with various technologies, and look at my photos.")),
			P(g.Text("I hope you enjoy your visit. Please leave a message in the guestbook if you did.")),
		),
		Div(
			c.Classes{"flex max-w-prose": true},
			Img(c.Classes{"h-fit": true}, Src("/static/images/guestbook.gif")),
			Div(
				c.Classes{
					"flex flex-col border border-gray-300 px-2 py-1 gap-1": true,
				},
				g.Map(comments, func(comment model.GuestbookEntry) g.Node {
					timeAgo, err := timeago.Parse(comment.CreatedAt)
					if err != nil {
						timeAgo = "Unknown"
					}
					return Div(c.Classes{"flex flex-col items-start text-sm whitespace-nowrap flex-wrap": true},
						Div(c.Classes{"flex gap-1 items-center": true}, Span(c.Classes{"font-bold": true}, g.Text(comment.Name)), Span(c.Classes{"text-xs text-gray-500": true}, g.Text(timeAgo))),
						Span(c.Classes{"whitespace-break-spaces": true}, g.Text(comment.Message)),
					)
				}),
			),
		),
		FormEl(
			c.Classes{
				"max-w-xs text-sm": true,
			},
			Action(route.Guestbook),
			Method("POST"),
			Div(
				c.Classes{
					"flex flex-col gap-1": true,
				},
				Input(c.Classes{"border bg-[#fdf4e3] border-gray-300 px-2 py-1": true}, Name("name"), Placeholder("Your name"), AutoComplete("given-name")),
				Textarea(c.Classes{"border bg-[#fdf4e3] border-gray-300 px-2 py-1": true}, Name("comment"), Placeholder("Comment")),
				Button(c.Classes{"font-[oswald] self-start bg-blue-600 text-white px-2 py-1": true}, Type("submit"), g.Text("Post comment")),
			),
		),
	)
}
