// Package views contain the visual elements of the application
package views

import (
	"website/views/components"
	"website/views/route"

	g "maragu.dev/gomponents"
	c "maragu.dev/gomponents/components"
	h "maragu.dev/gomponents/html"
)

func Page(title, path string, authenticated bool, body ...g.Node) g.Node {
	return c.HTML5(c.HTML5Props{
		Title:       title,
		Description: "Fredrik's homepage about software, development, sports and photography",
		Language:    "en",
		Head: []g.Node{
			h.Meta(h.Charset("UTF-8")),
			h.Meta(h.Name("viewport"), h.Content("width=device-width, initial-scale=1.0")),
			h.Meta(h.Name("keywords"), h.Content("Fredrik August Madsen-Malmo, homepage, software, development, programming, k3s, golang, rust, typescript")),
			h.Meta(h.Name("author"), h.Content("Fredrik August Madsen-Malmo")),

			components.TurnstileScript(),

			// Stylesheet
			h.Link(h.Rel("stylesheet"), h.Href("/static/styles/style.min.css")),

			// Open Graph / Facebook
			h.Meta(g.Attr("property", "og:type"), h.Content("website")),
			h.Meta(g.Attr("property", "og:title"), h.Content("Fredrik's Homepage")),
			h.Meta(g.Attr("property", "og:description"), h.Content("Fredrik's personal homepage - hosted on k3s")),
			h.Meta(g.Attr("property", "og:site_name"), h.Content("Fredrik's Homepage")),

			// Twitter
			h.Meta(h.Name("twitter:card"), h.Content("summary")),
			h.Meta(h.Name("twitter:title"), h.Content("Fredrik's Homepage")),
			h.Meta(h.Name("twitter:description"), h.Content("Fredrik's personal homepage - hosted on k3s")),

			// Favicon
			h.Link(h.Rel("apple-touch-icon"), g.Attr("sizes", "180x180"), h.Href("/static/apple-touch-icon.png")),
			h.Link(h.Rel("icon"), h.Type("image/png"), g.Attr("sizes", "32x32"), h.Href("/static/favicon-32x32.png")),
			h.Link(h.Rel("icon"), h.Type("image/png"), g.Attr("sizes", "16x16"), h.Href("/static/favicon-16x16.png")),
			h.Link(h.Rel("manifest"), h.Href("/static/site.webmanifest")),
		},
		Body: []g.Node{
			h.Body(c.Classes{"bg-[#fdf4e3] mx-auto container min-h-dvh flex flex-col": true},
				h.Main(
					c.Classes{
						"grid grid-rows-[auto_1fr_auto] py-2 px-4 gap-2 font-serif grow": true,
					},
					Navbar(path, authenticated),
					g.Group(body),
					MyFooter(),
				),
			),
		},
	})
}

func Navbar(currentPath string, authenticated bool) g.Node {
	return h.Nav(
		c.Classes{
			"flex items-center gap-2 py-1 text-sm font-sans [&_a]:hover:underline": true,
		},
		h.A(c.Classes{"underline": route.Root == currentPath}, h.Href(route.Root), g.Text("Home")),
		h.A(c.Classes{"underline": route.Albums == currentPath}, h.Href(route.Albums), g.Text("Photography")),
		h.A(c.Classes{"underline": route.Blog == currentPath}, h.Href(route.Blog), g.Text("Blog")),
		g.If(
			!authenticated,
			h.A(
				c.Classes{"underline": route.Login == currentPath, "ml-auto": true},
				h.Href(route.Login),
				g.Text("Login"),
			),
		),
		g.If(
			authenticated,
			h.Div(
				h.Class("contents"),
				h.Span(h.Class("ml-auto"), g.Text("Signed in")),
			),
		),
	)
}

func MyFooter() g.Node {
	return h.Footer(
		h.Class("text-xs text-gray-800 flex flex-col gap-2"),
		h.Hr(),
		h.P(g.Text("This web server is written in Go. It uses Gomponents and Tailwind for the UI. It's hosted in a Kubernetes (k3s) cluster on Hetzner cloud, using Traefik as a reverse proxy. The DNS, static asset caching and basic protection is handled on Cloudflare.")),
		h.A(
			h.Href("https://www.abuseipdb.com/user/244214"),
			h.Title("AbuseIPDB is an IP address blacklist for webmasters and sysadmins to report IP addresses engaging in abusive behavior on their networks"),
			h.Img(h.Src("https://www.abuseipdb.com/contributor/244214.svg"), h.Loading("lazy"), h.Class("h-8"), h.Alt("AbuseIPDB Contributor Badge")),
		),
		h.A(
			h.Class("flex gap-1 items-center font-sans"),
			h.Href("https://github.com/fredrikaugust/my-website"),
			h.Img(h.Src("/static/images/github-mark.svg"), h.Class("h-3"), h.Alt("github logo")),
			h.Target("_blank"),
			h.Rel("noreferrer"),
			g.Text("Source code"),
		),
	)
}
