package views

import (
	"website/views/route"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	. "maragu.dev/gomponents/html"
)

func Login(authenticated bool) g.Node {
	return Page(
		"Login",
		route.Login,
		authenticated,
		Form(
			c.Classes{"font-sans text-sm": true},
			Action(route.Login),
			Method("POST"),
			Div(
				c.Classes{"flex flex-col gap-2 items-start": true},
				Input(
					c.Classes{"border bg-white border-gray-300 px-2 py-1": true},
					Type("email"),
					Name("email"),
					Placeholder("Email"),
					AutoComplete("username email"),
					Required(),
				),
				Input(
					c.Classes{"border bg-white border-gray-300 px-2 py-1": true},
					Type("password"),
					Name("password"),
					Placeholder("Password"),
					AutoComplete("current-password"),
					Required(),
				),
				Button(c.Classes{"font-sans self-start bg-gray-800 text-white px-2 py-1": true}, Type("submit"), g.Text("Login")),
			),
		),
	)
}
