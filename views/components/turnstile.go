// Package components contains different reusable components
package components

import (
	g "maragu.dev/gomponents"
	h "maragu.dev/gomponents/html"
)

func TurnstileScript() g.Node {
	return h.Script(h.Src("https://challenges.cloudflare.com/turnstile/v0/api.js")) //, h.Async(), h.Defer())
}

func TurnstileDiv(sitekey, callbackFunction string) g.Node {
	return h.Div(h.Class("cf-turnstile"), h.Data("sitekey", sitekey), h.Data("callback", callbackFunction))
}
