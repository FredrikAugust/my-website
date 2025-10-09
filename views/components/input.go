package components

import (
	g "maragu.dev/gomponents"
	h "maragu.dev/gomponents/html"
)

func Input(content ...g.Node) g.Node {
	return h.Input(h.Class("border bg-white border-gray-300 px-2 py-1"), g.Group(content))
}
