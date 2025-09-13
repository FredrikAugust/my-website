package handlers

import (
	"context"
	"net/http"
	"website/model"

	"github.com/go-chi/chi/v5"
)

type guestbook interface {
	PostComment(ctx context.Context, name model.Name, comment model.Comment) error
}

func PostComment(mux chi.Router, g guestbook) {
	mux.Post("/guestbook", func(w http.ResponseWriter, r *http.Request) {
		name := model.Name(r.FormValue("name"))
		comment := model.Comment(r.FormValue("comment"))

		if !name.IsValid() {
			http.Error(w, "name is not valid", http.StatusBadRequest)
			return
		}

		if !comment.IsValid() {
			http.Error(w, "comment is not valid", http.StatusBadRequest)
			return
		}

		if err := g.PostComment(r.Context(), name, comment); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		http.Redirect(w, r, "/", http.StatusFound)
	})
}
