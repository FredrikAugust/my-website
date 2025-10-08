package views

import (
	"strconv"

	"website/model"
	"website/views/components"
	"website/views/route"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	h "maragu.dev/gomponents/html"

	"github.com/SerhiiCho/timeago/v3"
)

func FrontPage(authenticated bool, comments []model.GuestbookEntry, turnstileSitekey string) g.Node {
	return Page(
		"Fredrik",
		route.Root,
		authenticated,
		h.H1(c.Classes{
			"text-4xl leading-[1.3] font-bold font-display text-transparent bg-clip-text bg-contain bg-[url('/static/images/sparkles.gif')]": true,
		}, g.Text("Fredrik's Homepage")),
		h.Div(
			c.Classes{
				"text-gray-800 text-sm": true,
			},
			h.P(g.Text("Here you can read about my experiments and experiences with various technologies, and look at my photos.")),
			h.P(g.Text("I hope you enjoy your visit. Please leave a message in the guestbook if you did.")),
		),
		h.Div(
			c.Classes{"flex flex-col": true},
			h.Img(c.Classes{"w-30": true}, h.Src("/static/images/guestbook.gif"), h.Alt("an old man writing in a guestbook")),
			h.Div(
				c.Classes{
					"flex flex-col border border-gray-300 px-2 py-1 gap-1 h-80 overflow-y-auto": true,
				},
				g.Map(comments, func(comment model.GuestbookEntry) g.Node {
					timeAgo, err := timeago.Parse(comment.CreatedAt)
					if err != nil {
						timeAgo = "Unknown"
					}
					return h.Div(c.Classes{"flex flex-col items-start text-sm whitespace-nowrap flex-wrap": true},
						h.Div(
							c.Classes{"flex gap-1 items-center": true},
							h.Span(c.Classes{"font-bold": true}, g.Text(comment.Name)),
							h.Span(c.Classes{"text-xs text-gray-600": true}, g.Text(timeAgo)),
							g.If(authenticated, h.Form(
								h.Action(route.GuestbookDelete),
								h.Method("POST"), // DELETE in browsers just does GET with query params
								h.Input(h.Type("hidden"), h.Name("comment_id"), h.Value(strconv.Itoa(comment.CommentID))),
								h.Button(h.Type("submit"), c.Classes{"text-red-600 text-xs font-sans cursor-pointer": true}, g.Text("Delete comment")),
							)),
						),
						h.Span(c.Classes{"whitespace-break-spaces": true}, g.Text(comment.Message)),
					)
				}),
			),
		),
		h.Form(
			c.Classes{
				"text-sm": true,
			},
			h.Action(route.Guestbook),
			h.Method("POST"),
			h.Script(g.Text("function enableGuesbookSubmit() { guestbookSubmit.disabled = false; }")),
			h.Div(
				c.Classes{
					"flex flex-col gap-1": true,
				},
				h.Input(
					c.Classes{"border bg-white border-gray-300 px-2 py-1": true},
					h.Name("name"),
					h.Placeholder("Your name"),
					h.AutoComplete("given-name"),
					h.Required(),
					h.MinLength("1"),
					h.MaxLength("100"),
				),
				h.Textarea(
					c.Classes{"border bg-white border-gray-300 px-2 py-1": true},
					h.Name("comment"),
					h.Placeholder("Comment"),
					h.Required(),
					h.MinLength("1"),
					h.MaxLength("1000"),
				),
				components.TurnstileDiv(turnstileSitekey, "enableGuesbookSubmit"),
				h.Button(c.Classes{"font-sans self-start bg-gray-800 text-white px-2 py-1": true}, h.ID("guestbookSubmit"), h.Disabled(), h.Type("submit"), g.Text("Post comment")),
			),
		),
	)
}
