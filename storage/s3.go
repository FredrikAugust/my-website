package storage

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"go.uber.org/zap"
)

type BlobStorage interface {
	Connect(ctx context.Context, log *zap.Logger) error
}

type S3 struct {
	client *s3.Client

	endpoint string
}

func NewS3(endpoint string) *S3 {
	return &S3{
		endpoint: endpoint,
	}
}

func (s *S3) Connect(ctx context.Context, log *zap.Logger) error {
	cfg, err := config.LoadDefaultConfig(ctx, config.WithBaseEndpoint(s.endpoint))
	if err != nil {
		log.Error("could not create aws configuration", zap.Error(err))
		return err
	}

	s3Client := s3.NewFromConfig(cfg)

	s.client = s3Client

	log.Info("connected to s3")

	return nil
}
