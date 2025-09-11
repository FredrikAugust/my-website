package views

import (
	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	. "maragu.dev/gomponents/html"
)

func FrontPage() g.Node {
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
			P(g.Text("I hope with this website to be a fun experience inspired by the earlier internet — before the surge of AI slop.")),
			P(g.Text("Please leave a message in the guestbook if you enjoyed the visit.")),
		),
	)
}
