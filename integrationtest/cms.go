package integrationtest

import (
	"context"
	"website/model"
)

type mockCMSClient struct{}

func (m *mockCMSClient) GetAlbums(ctx context.Context) ([]model.Album, error) {
	return make([]model.Album, 0), nil
}
func (m *mockCMSClient) GetAlbumWithPhotos(ctx context.Context, albumID int) (model.AlbumWithPhotos, error) {
	return model.AlbumWithPhotos{}, nil
}
func (m *mockCMSClient) GetRecentPhotos(ctx context.Context) ([]model.Photo, error) {
	return make([]model.Photo, 0), nil
}
func (m *mockCMSClient) GetBlogPosts(ctx context.Context) ([]model.BlogPost, error) {
	return make([]model.BlogPost, 0), nil
}
func (m *mockCMSClient) GetBlogPost(ctx context.Context, slug string) (model.BlogPost, error) {
	return model.BlogPost{}, nil
}
func (m *mockCMSClient) GetRecentBlogPosts(ctx context.Context) ([]model.BlogPost, error) {
	return make([]model.BlogPost, 0), nil
}
