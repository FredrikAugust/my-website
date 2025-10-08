// Package email deals with sending emails from the server to the user
package email

import (
	"context"
	"fmt"

	"github.com/resend/resend-go/v2"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

var (
	traceProvider = otel.GetTracerProvider()
	tracer        = traceProvider.Tracer("email")
)

type EmailClient interface {
	SendEmail(ctx context.Context, from, subject, body string) error
}

type ResendEmailClient struct {
	client resend.Client
	logger *zap.Logger
}

// DummyEmailClient is used locally to test without actually sending emails.
// This will just print the email in the console.
type DummyEmailClient struct {
	logger *zap.Logger
}

type NewEmailClientOptions struct {
	APIKey string
	Logger *zap.Logger
}

func NewEmailClient(options NewEmailClientOptions) *ResendEmailClient {
	return &ResendEmailClient{
		client: *resend.NewClient(options.APIKey),
		logger: options.Logger,
	}
}

func NewDummyEmailClient(logger *zap.Logger) *DummyEmailClient {
	return &DummyEmailClient{
		logger: logger,
	}
}

func (e *ResendEmailClient) SendEmail(ctx context.Context, from, subject, body string) error {
	ctx, span := tracer.Start(
		ctx,
		"email.send",
		trace.WithAttributes(
			attribute.String("email.from", from),
			attribute.String("email.to", "Fredrik Malmo <contact@fredrikmalmo.com>"),
			attribute.String("email.subject", subject),
			attribute.Int("email.body.length", len(body)),
		),
	)
	defer span.End()
	_, err := e.client.Emails.SendWithContext(ctx, &resend.SendEmailRequest{
		From:    fmt.Sprintf("%s <noreply@fredrikmalmo.com>", from),
		To:      []string{"Fredrik Malmo <contact@fredrikmalmo.com>"},
		Subject: subject,
		Text:    body,
	})
	if err != nil {
		e.logger.Warn("failed to send email", zap.String("from", from), zap.String("subject", subject))
		return err
	}

	e.logger.Info("send email", zap.String("from", from), zap.String("subject", subject))

	return nil
}

func (de *DummyEmailClient) SendEmail(_ context.Context, from, subject, body string) error {
	de.logger.Info("debug implementation of email", zap.String("from", from), zap.String("subject", subject))

	return nil
}
