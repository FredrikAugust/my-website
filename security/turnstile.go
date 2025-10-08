// Package security handles everything related to security both in application and infra layer
package security

import (
	"bytes"
	"context"
	"encoding/json"
	"mime/multipart"
	"net/http"

	"go.opentelemetry.io/otel"
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
	Validate(ctx context.Context, request *http.Request) error
}

type CfTurnstileClient struct {
	Secret string
}

var (
	tracerProvider = otel.GetTracerProvider()
	tracer         = tracerProvider.Tracer("chi")
)

func (t *CfTurnstileClient) Validate(ctx context.Context, r *http.Request) error {
	ctx, span := tracer.Start(ctx, "turnstile.verify")
	defer span.End()

	response := r.FormValue("cf-turnstile-response")
	realip := r.FormValue("CF-Connecting-IP")

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	writer.WriteField("secret", t.Secret)
	writer.WriteField("response", response)
	if realip != "" {
		writer.WriteField("realip", realip)
	}
	if err := writer.Close(); err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		body,
	)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	if err != nil {
		return err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	result := make(map[string]any)
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return err
	}

	if success, ok := result["success"].(bool); ok && success {
		return nil
	}

	return err
}
