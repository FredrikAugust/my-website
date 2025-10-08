// Package email deals with sending emails from the server to the user
package email

import (
	"context"
	"fmt"

	"github.com/resend/resend-go/v2"
	"go.uber.org/zap"
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
	_, err := e.client.Emails.SendWithContext(ctx, &resend.SendEmailRequest{
		From:    fmt.Sprintf("%s <noreply@fredrikmalmo.com>", from),
		To:      []string{"Fredrik Malmo <contact@fredrikmalmo.com>"},
		Subject: subject,
		Text:    body,
	})
	if err != nil {
		return err
	}

	e.logger.Info("debug implementation of email", zap.String("from", from), zap.String("subject", subject))

	return nil
}

func (de *DummyEmailClient) SendEmail(_ context.Context, from, subject, body string) error {
	de.logger.Info("send email", zap.String("from", from), zap.String("subject", subject), zap.String("body", body))
	return nil
}
