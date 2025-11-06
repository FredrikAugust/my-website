package storage

import (
	"context"
	"website/model"

	"github.com/ainsleyclark/go-payloadcms"
)

const (
	collectionAlbum = "album"
	collectionPhoto = "photo"
)

type CMSClient struct {
	client *payloadcms.Client
}

func NewCMSClient(baseURL string) (*CMSClient, error) {
	client, err := payloadcms.New(
		payloadcms.WithBaseURL(baseURL),
	)

	if err != nil {
		return nil, err
	}

	return &CMSClient{
		client: client,
	}, nil
}

func (c *CMSClient) GetAlbums(ctx context.Context) ([]model.Album, error) {
	var albums payloadcms.ListResponse[model.Album]
	_, err := c.client.Collections.List(ctx, collectionAlbum, payloadcms.ListParams{}, &albums, payloadcms.WithDepth(0))

	if err != nil {
		return nil, err
	}

	return albums.Docs, nil
}

func (c *CMSClient) GetAlbumWithPhotos(ctx context.Context, albumID int) (model.AlbumWithPhotos, error) {
	var album model.AlbumWithPhotos
	_, err := c.client.Collections.FindByID(ctx, collectionAlbum, albumID, &album)

	if err != nil {
		return model.AlbumWithPhotos{}, err
	}

	return album, nil
}

// GetRecentPhotos implements handlers.recentPhotosGetter.
func (c *CMSClient) GetRecentPhotos(ctx context.Context) ([]model.Photo, error) {
	var photos payloadcms.ListResponse[model.Photo]
	_, err := c.client.Collections.List(ctx, collectionPhoto, payloadcms.ListParams{Sort: "-createdAt", Limit: 3}, &photos)

	if err != nil {
		return make([]model.Photo, 0), err
	}

	return photos.Docs, nil
}
