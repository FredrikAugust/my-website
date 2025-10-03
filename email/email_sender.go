package email

import (
	"context"
	"fmt"

	"github.com/resend/resend-go/v2"
	"go.uber.org/zap"
)

type EmailClient struct {
	client resend.Client
	logger *zap.Logger
}

type NewEmailClientOptions struct {
	ApiKey string
	Logger *zap.Logger
}

func NewEmailClient(options NewEmailClientOptions) *EmailClient {
	return &EmailClient{
		client: *resend.NewClient(options.ApiKey),
		logger: options.Logger,
	}
}

func (e *EmailClient) SendEmail(ctx context.Context, from, subject, body string) error {
	_, err := e.client.Emails.SendWithContext(ctx, &resend.SendEmailRequest{
		From:    fmt.Sprintf("%s <noreply@fredrikmalmo.com>", from),
		To:      []string{"Fredrik Malmo <contact@fredrikmalmo.com>"},
		Subject: subject,
		Text:    body,
	})

	if err != nil {
		return err
	}

	e.logger.Info("sent email", zap.String("from", from), zap.String("subject", subject))

	return nil
}
