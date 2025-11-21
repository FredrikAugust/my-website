package views

import (
	"website/views/route"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	h "maragu.dev/gomponents/html"
)

func Login(authenticated bool) g.Node {
	return Page(PageOptions{
		Title:         "Login",
		Path:          route.Login,
		Authenticated: authenticated,
		Body: []g.Node{h.Form(
			c.Classes{"font-sans text-sm": true},
			h.Action(route.Login),
			h.Method("POST"),
			h.Div(
				c.Classes{"flex flex-col gap-2 items-start": true},
				h.Input(
					c.Classes{"border bg-white border-gray-300 px-2 py-1": true},
					h.Type("email"),
					h.Name("email"),
					h.Placeholder("Email"),
					h.AutoComplete("username email"),
					h.Required(),
				),
				h.Input(
					c.Classes{"border bg-white border-gray-300 px-2 py-1": true},
					h.Type("password"),
					h.Name("password"),
					h.Placeholder("Password"),
					h.AutoComplete("current-password"),
					h.Required(),
				),
				h.Button(c.Classes{"font-sans self-start bg-gray-800 text-white px-2 py-1": true}, h.Type("submit"), g.Text("Login")),
			),
		)},
	})
}
