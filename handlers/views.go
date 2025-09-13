package handlers

import (
	"context"
	"net/http"
	"website/model"
	"website/views"

	"github.com/go-chi/chi/v5"
)

type guestbookGetter interface {
	GetComments(ctx context.Context) ([]model.GuestbookEntry, error)
}

func FrontPage(mux chi.Router, g guestbookGetter) {
	mux.Get("/", func(w http.ResponseWriter, r *http.Request) {
		comments, err := g.GetComments(r.Context())

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		_ = views.FrontPage(comments).Render(w)
	})
}
