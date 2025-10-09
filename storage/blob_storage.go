package storage

import (
	"context"
	"io"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"go.uber.org/zap"
)

type BlobStorage interface {
	Connect(ctx context.Context, log *zap.Logger) error
	Upload(ctx context.Context, bucketName, filePath string, content io.Reader) error
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

func (s *S3) Upload(ctx context.Context, bucketName, filePath string, content io.Reader) error {
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Key:    &filePath,
		Bucket: &bucketName,
		Body:   content,
	})

	return err
}
