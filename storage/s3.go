package storage

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"go.uber.org/zap"
)

type S3 struct {
	client *s3.Client
}

func NewS3() *S3 {
	return &S3{}
}

func (s *S3) Connect(ctx context.Context, log *zap.Logger) error {
	endpoint := "https://nbg1.your-objectstorage.com"

	cfg, err := config.LoadDefaultConfig(ctx, config.WithBaseEndpoint(endpoint))
	if err != nil {
		log.Error("could not create aws configuration", zap.Error(err))
		return err
	}

	s3Client := s3.NewFromConfig(cfg)

	s.client = s3Client

	log.Info("connected to s3")

	return nil
}
