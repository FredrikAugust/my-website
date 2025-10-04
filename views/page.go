// The templates for all the pages
package views

import (
	"website/views/route"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	. "maragu.dev/gomponents/html"
)

func Page(title, path string, body ...g.Node) g.Node {
	return c.HTML5(c.HTML5Props{
		Title:       title,
		Description: "Fredrik's homepage about software, development, sports and photography",
		Language:    "en",
		Head: []g.Node{
			Meta(Charset("UTF-8")),
			Meta(Name("viewport"), Content("width=device-width, initial-scale=1.0")),
			Meta(Name("keywords"), Content("Fredrik, homepage, software, development, programming, k3s")),
			Meta(Name("author"), Content("Fredrik August")),

			// Stylesheet
			Link(Rel("stylesheet"), Href("/static/styles/style.min.css")),

			// Open Graph / Facebook
			Meta(g.Attr("property", "og:type"), Content("website")),
			Meta(g.Attr("property", "og:title"), Content("Fredrik's Homepage")),
			Meta(g.Attr("property", "og:description"), Content("Fredrik's personal homepage - hosted on k3s")),
			Meta(g.Attr("property", "og:site_name"), Content("Fredrik's Homepage")),

			// Twitter
			Meta(Name("twitter:card"), Content("summary")),
			Meta(Name("twitter:title"), Content("Fredrik's Homepage")),
			Meta(Name("twitter:description"), Content("Fredrik's personal homepage - hosted on k3s")),

			// Favicon
			Link(Rel("apple-touch-icon"), g.Attr("sizes", "180x180"), Href("/static/apple-touch-icon.png")),
			Link(Rel("icon"), Type("image/png"), g.Attr("sizes", "32x32"), Href("/static/favicon-32x32.png")),
			Link(Rel("icon"), Type("image/png"), g.Attr("sizes", "16x16"), Href("/static/favicon-16x16.png")),
			Link(Rel("manifest"), Href("/static/site.webmanifest")),
		},
		Body: []g.Node{
			Body(c.Classes{"bg-[#fdf4e3] max-w-prose": true},
				Main(
					c.Classes{
						"grid grid-rows-[auto_1fr] py-2 px-4 gap-2 font-serif": true,
					},
					Navbar(path),
					g.Group(body),
					MyFooter(),
				),
			),
		},
	})
}

func Navbar(currentPath string) g.Node {
	return Nav(
		c.Classes{
			"flex items-center gap-2 py-1 text-sm font-sans": true,
		},
		A(c.Classes{"underline": route.Root == currentPath, "hover:underline": true}, Href(route.Root), g.Text("Home")),
		A(c.Classes{"underline": route.Albums == currentPath, "hover:underline": true}, Href(route.Albums), g.Text("Photography")),
	)
}

func MyFooter() g.Node {
	return Footer(
		c.Classes{
			"text-sm text-gray-800 max-w-prose": true,
		},
		P(g.Text("This web server is written in Go. It uses Gomponents and Tailwind for the UI. It's hosted in a Kubernetes (k3s) cluster on Hetzner cloud, using Traefik as a reverse proxy. The DNS, static asset caching and basic protection is handled on Cloudflare.")),
	)
}
