package storage

import (
	"context"
	"errors"
	"website/model"

	"github.com/ainsleyclark/go-payloadcms"
)

const (
	collectionAlbum     = "album"
	collectionPhoto     = "photo"
	collectionBlogPosts = "blog"
)

type CMSClient interface {
	GetAlbums(ctx context.Context) ([]model.Album, error)
	GetAlbumWithPhotos(ctx context.Context, albumID int) (model.AlbumWithPhotos, error)
	GetRecentPhotos(ctx context.Context) ([]model.Photo, error)
	GetBlogPosts(ctx context.Context) ([]model.BlogPost, error)
	GetBlogPost(ctx context.Context, slug string) (model.BlogPost, error)
	GetRecentBlogPosts(ctx context.Context) ([]model.BlogPost, error)
}

type PayloadCMSClient struct {
	client *payloadcms.Client
}

func NewCMSClient(baseURL string) (*PayloadCMSClient, error) {
	client, err := payloadcms.New(
		payloadcms.WithBaseURL(baseURL),
	)

	if err != nil {
		return nil, err
	}

	return &PayloadCMSClient{
		client: client,
	}, nil
}

func (c *PayloadCMSClient) GetAlbums(ctx context.Context) ([]model.Album, error) {
	var albums payloadcms.ListResponse[model.Album]
	_, err := c.client.Collections.List(ctx, collectionAlbum, payloadcms.ListParams{}, &albums, payloadcms.WithDepth(0))

	if err != nil {
		return nil, err
	}

	return albums.Docs, nil
}

func (c *PayloadCMSClient) GetAlbumWithPhotos(ctx context.Context, albumID int) (model.AlbumWithPhotos, error) {
	var album model.AlbumWithPhotos
	_, err := c.client.Collections.FindByID(ctx, collectionAlbum, albumID, &album)

	if err != nil {
		return model.AlbumWithPhotos{}, err
	}

	return album, nil
}

// GetRecentPhotos implements handlers.recentPhotosGetter.
func (c *PayloadCMSClient) GetRecentPhotos(ctx context.Context) ([]model.Photo, error) {
	var photos payloadcms.ListResponse[model.Photo]
	_, err := c.client.Collections.List(ctx, collectionPhoto, payloadcms.ListParams{Sort: "-createdAt", Limit: 3}, &photos)

	if err != nil {
		return make([]model.Photo, 0), err
	}

	return photos.Docs, nil
}

func (c *PayloadCMSClient) GetBlogPosts(ctx context.Context) ([]model.BlogPost, error) {
	var posts payloadcms.ListResponse[model.BlogPost]
	_, err := c.client.Collections.List(ctx, collectionBlogPosts, payloadcms.ListParams{}, &posts)

	if err != nil {
		return make([]model.BlogPost, 0), err
	}

	return posts.Docs, nil
}

func (c *PayloadCMSClient) GetBlogPost(ctx context.Context, slug string) (model.BlogPost, error) {
	var posts payloadcms.ListResponse[model.BlogPost]
	_, err := c.client.Collections.List(ctx, collectionBlogPosts, payloadcms.ListParams{
		Where: payloadcms.Query().Equals("slug", slug),
		Limit: 1,
	}, &posts)

	if err != nil {
		return model.BlogPost{}, err
	}

	if len(posts.Docs) == 0 {
		return model.BlogPost{}, errors.New("no document found for slug")
	}

	return posts.Docs[0], nil
}

func (c *PayloadCMSClient) GetRecentBlogPosts(ctx context.Context) ([]model.BlogPost, error) {
	var blogPosts payloadcms.ListResponse[model.BlogPost]
	_, err := c.client.Collections.List(
		ctx,
		collectionBlogPosts,
		payloadcms.ListParams{
			Sort:  "-publishedAt",
			Limit: 3,
		},
		&blogPosts,
	)

	if err != nil {
		return make([]model.BlogPost, 0), err
	}

	return blogPosts.Docs, nil
}
