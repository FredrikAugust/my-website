// The templates for all the pages
package views

import (
	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	. "maragu.dev/gomponents/html"
)

func Page(title, path string, body ...g.Node) g.Node {
	return c.HTML5(c.HTML5Props{
		Title:       title,
		Description: "",
		Language:    "en",
		Head: []g.Node{
			Script(Src("https://cdn.tailwindcss.com?plugins=forms,typography")),
		},
		Body: []g.Node{
			Main(
				c.Classes{
					"grid grid-rows-[auto_1fr] p-2 gap-2": true,
				},
				Navbar(),
				g.Group(body),
				MyFooter(),
			),
		},
	})
}

func Navbar() g.Node {
	return Nav(
		c.Classes{
			"flex items-center gap-2 px-2 py-1 underline text-sm": true,
		},
		A(Href("/"), g.Text("Home")),
		A(Href("/photos"), g.Text("Photography")),
	)
}

func MyFooter() g.Node {
	return Footer(
		c.Classes{
			"text-sm text-gray-700 max-w-prose": true,
		},
		P(g.Text("This website is written in Go. It uses Gomponents to build the UI. It's hosted in a Kubernetes (k3s) cluster on Hetzner cloud, using Traefik as a reverse proxy. The DNS (and some rudimentary protection) is handled on Cloudflare.")),
	)
}
