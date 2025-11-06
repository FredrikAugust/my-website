package components

import (
	g "maragu.dev/gomponents"
	h "maragu.dev/gomponents/html"
)

func Button(content ...g.Node) g.Node {
	return h.Button(h.Class("font-sans disabled:bg-gray-200 transition self-start bg-gray-800 text-white px-2 py-1"), g.Group(content))
}
