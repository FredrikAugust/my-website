package handlers

import (
	"context"
	"net/http"
	"strconv"
	"website/model"
	"website/views"
	"website/views/route"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type guestbookGetter interface {
	GetComments(ctx context.Context) ([]model.GuestbookEntry, error)
}

type requestSessionStore interface {
	GetSessionFromRequest(r *http.Request) (model.Email, error)
}

func FrontPage(mux chi.Router, g guestbookGetter, rss requestSessionStore, logger *zap.Logger) {
	mux.Get("/", func(w http.ResponseWriter, r *http.Request) {
		comments, err := g.GetComments(r.Context())

		if err != nil {
			logger.Warn("failed to fetch guestbook comments", zap.Error(err))
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		logger.Info("guestbook comments fetched successfully", zap.Int("count", len(comments)))

		_, err = rss.GetSessionFromRequest(r)

		_ = views.FrontPage(err == nil, comments).Render(w)
	})
}

type photoGetter interface {
	GetAlbums(ctx context.Context) ([]model.Album, error)
	GetPhotos(ctx context.Context, albumId int) ([]model.Photo, error)
}

func Photography(mux chi.Router, p photoGetter, rss requestSessionStore, logger *zap.Logger) {
	mux.Get("/albums", func(w http.ResponseWriter, r *http.Request) {
		albums, err := p.GetAlbums(r.Context())

		if err != nil {
			logger.Warn("failed to fetch photos", zap.Error(err))
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		_, err = rss.GetSessionFromRequest(r)

		_ = views.Albums(albums, err == nil).Render(w)
	})

	mux.Get("/albums/{albumId:[0-9]+}", func(w http.ResponseWriter, r *http.Request) {
		albumId, err := strconv.Atoi(chi.URLParam(r, "albumId"))
		if err != nil {
			logger.Warn("failed to parse album ID", zap.Error(err))
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		photos, err := p.GetPhotos(r.Context(), albumId)
		if err != nil {
			logger.Warn("failed to fetch photos", zap.Error(err))
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		_, err = rss.GetSessionFromRequest(r)

		_ = views.Album(albumId, photos, err == nil).Render(w)
	})
}

func Login(mux chi.Router, rss requestSessionStore) {
	mux.Get(route.Login, func(w http.ResponseWriter, r *http.Request) {
		_, err := rss.GetSessionFromRequest(r)
		_ = views.Login(err == nil).Render(w)
	})
}
