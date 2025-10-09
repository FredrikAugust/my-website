// Package handlers have the logic for handling incoming HTTP requests
package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"website/email"
	"website/model"
	"website/security"
	"website/views/route"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type guestbook interface {
	PostComment(ctx context.Context, name model.Name, comment model.Comment) error
	DeleteComment(ctx context.Context, commentID int) error
}

func DeleteComment(mux chi.Router, g guestbook, rss requestSessionStore, log *zap.Logger) {
	mux.Post(route.GuestbookDelete, func(w http.ResponseWriter, r *http.Request) {
		_, err := rss.GetSessionFromRequest(r)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		commentID := r.FormValue("comment_id")

		commentIDNum, err := strconv.Atoi(commentID)
		if err != nil {
			log.Warn("comment id was not a number", zap.String("commentID", commentID), zap.Error(err))
			http.Error(w, "comment id was not a number", http.StatusBadRequest)
			return
		}

		err = g.DeleteComment(r.Context(), commentIDNum)
		if err != nil {
			http.Error(w, "failed to delete comment", http.StatusInternalServerError)
			return
		}

		http.Redirect(w, r, route.Root, http.StatusFound)
	})
}

func PostComment(mux chi.Router, g guestbook, e email.EmailClient, t security.TurnstileClient, log *zap.Logger) {
	mux.Post(route.Guestbook, func(w http.ResponseWriter, r *http.Request) {
		if err := t.Validate(r.Context(), r); err != nil {
			log.Info("request failed turnstile validation")
			http.Error(w, "failed turnstile validation", http.StatusForbidden)
			return
		}

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

		// Just spin this off in the background. We don't need to wait :)
		go e.SendEmail(
			context.WithoutCancel(r.Context()),
			name.String(),
			"New Comment from "+name.String(),
			fmt.Sprintf("You've gotten a new comment from %s.\n\n%s", name.String(), comment.String()),
		)

		http.Redirect(w, r, route.Root, http.StatusFound)
	})
}
