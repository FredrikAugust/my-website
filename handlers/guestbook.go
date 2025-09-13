package handlers

import (
	"context"
	"net/http"
	"website/model"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type guestbook interface {
	PostComment(ctx context.Context, name model.Name, comment model.Comment) error
}

func PostComment(mux chi.Router, g guestbook, log *zap.Logger) {
	mux.Post("/guestbook", func(w http.ResponseWriter, r *http.Request) {
		name := model.Name(r.FormValue("name"))
		comment := model.Comment(r.FormValue("comment"))

		if !name.IsValid() {
			log.Warn("name is not valid", zap.String("name", string(name)))
			http.Error(w, "name is not valid", http.StatusBadRequest)
			return
		}

		if !comment.IsValid() {
			log.Warn("comment is not valid", zap.String("comment", string(comment)))
			http.Error(w, "comment is not valid", http.StatusBadRequest)
			return
		}

		if err := g.PostComment(r.Context(), name, comment); err != nil {
			log.Warn("failed to post comment", zap.Error(err))
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		log.Info("comment posted", zap.String("name", string(name)), zap.String("comment", string(comment)))

		http.Redirect(w, r, "/", http.StatusFound)
	})
}
