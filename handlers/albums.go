package handlers

import (
	"context"
	"net/http"

	"website/views/route"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type albumCreator interface {
	CreateAlbum(ctx context.Context, albumName string) error
}

func CreateAlbum(mux chi.Router, rss requestSessionStore, a albumCreator, log *zap.Logger) {
	mux.Post(route.Albums, func(w http.ResponseWriter, r *http.Request) {
		_, err := rss.GetSessionFromRequest(r)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		albumName := r.FormValue("name")
		if albumName == "" {
			http.Error(w, "name can't be empty", http.StatusBadRequest)
			return
		}

		err = a.CreateAlbum(r.Context(), albumName)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		log.Info("album created", zap.String("name", albumName))

		http.Redirect(w, r, route.Albums, http.StatusFound)
	})
}
