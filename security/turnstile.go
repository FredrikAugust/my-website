// Package security handles everything related to security both in application and infra layer
package security

type TurnstileOptions struct {
	Sitekey string
	Secret  string
}

// Cloudflare Turnstile test keys
// These keys are for testing purposes only and should not be used in production
const (
	// Sitekeys
	// AlwaysPassesVisible - Always passes, visible challenge
	AlwaysPassesVisibleSitekey = "1x00000000000000000000AA"

	// AlwaysBlocksVisible - Always blocks, visible challenge
	AlwaysBlocksVisibleSitekey = "2x00000000000000000000AB"

	// AlwaysPassesInvisible - Always passes, invisible challenge
	AlwaysPassesInvisibleSitekey = "1x00000000000000000000BB"

	// AlwaysBlocksInvisible - Always blocks, invisible challenge
	AlwaysBlocksInvisibleSitekey = "2x00000000000000000000BB"

	// ForcesInteractiveVisible - Forces an interactive challenge, visible
	ForcesInteractiveVisibleSitekey = "3x00000000000000000000FF"

	// Secret keys
	// AlwaysPassesSecret - Always passes validation
	AlwaysPassesSecret = "1x0000000000000000000000000000000AA"

	// AlwaysFailsSecret - Always fails validation
	AlwaysFailsSecret = "2x0000000000000000000000000000000AA"

	// TokenAlreadySpentSecret - Yields a "token already spent" error
	TokenAlreadySpentSecret = "3x0000000000000000000000000000000AA"
)
