package handlers

import (
	"context"
	"net/http"
	"website/model"
	"website/views"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type guestbookGetter interface {
	GetComments(ctx context.Context) ([]model.GuestbookEntry, error)
}

func FrontPage(mux chi.Router, g guestbookGetter, logger *zap.Logger) {
	mux.Get("/", func(w http.ResponseWriter, r *http.Request) {
		comments, err := g.GetComments(r.Context())

		if err != nil {
			logger.Warn("failed to fetch guestbook comments", zap.Error(err))
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		logger.Info("guestbook comments fetched successfully", zap.Int("count", len(comments)))

		_ = views.FrontPage(comments).Render(w)
	})
}

type photoGetter interface {
	GetPhotos(ctx context.Context) ([]model.Photo, error)
}

func Photography(mux chi.Router, p photoGetter, logger *zap.Logger) {
	mux.Get("/photos", func(w http.ResponseWriter, r *http.Request) {
		photos, err := p.GetPhotos(r.Context())

		if err != nil {
			logger.Warn("failed to fetch photos", zap.Error(err))
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		_ = views.Photos(photos).Render(w)
	})
}
