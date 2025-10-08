// Package security handles everything related to security both in application and infra layer
package security

import (
	"context"
	"fmt"
	"net/http"
	"strings"
)

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

	// DummyResponseToken - The token which is always returned from challenge when using testing sitekey
	DummyResponseToken = "XXXX.DUMMY.TOKEN.XXXX"

	// TurnstileResponseKeyFormBodyName - The form body key which contains the response key
	TurnstileResponseKeyFormBodyName = "cf-turnstile-response"
)

type TurnstileFrontendOptions struct {
	Sitekey string
}

type TurnstileClient interface {
	Validate(ctx context.Context, responseKey string) error
}

type CfTurnstileClient struct {
	Secret string
}

func (t *CfTurnstileClient) Validate(ctx context.Context, responseKey string) error {
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		strings.NewReader(
			fmt.Sprintf(
				`{ "params": { "secret": "%s", "response": %s } }`,
				t.Secret,
				responseKey,
			),
		),
	)
	if err != nil {
		return err
	}

	_, err = http.DefaultClient.Do(req)
	if err != nil {
		return err
	}

	return nil
}
