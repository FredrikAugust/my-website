package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"website/model"
	"website/views/route"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"
)

type guestbook interface {
	PostComment(ctx context.Context, name model.Name, comment model.Comment) error
	DeleteComment(ctx context.Context, commentID int) error
}

type emailClient interface {
	SendEmail(ctx context.Context, from, subject, body string) error
}

func DeleteComment(mux chi.Router, g guestbook, rss requestSessionStore, log *zap.Logger) {
	mux.Post(route.GuestbookDelete, func(w http.ResponseWriter, r *http.Request) {
		commentID := r.FormValue("comment_id")

		commmentIDNum, err := strconv.Atoi(commentID)
		if err != nil {
			log.Warn("comment id was not a number", zap.String("commentID", commentID), zap.Error(err))
			w.WriteHeader(http.StatusBadRequest)
		}

		_, err = rss.GetSessionFromRequest(r)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		err = g.DeleteComment(r.Context(), commmentIDNum)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		http.Redirect(w, r, route.Root, http.StatusFound)
	})
}

func PostComment(mux chi.Router, g guestbook, e emailClient, log *zap.Logger) {
	mux.Post(route.Guestbook, func(w http.ResponseWriter, r *http.Request) {
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

		err := e.SendEmail(
			r.Context(),
			name.String(),
			"New Comment from "+name.String(),
			fmt.Sprintf("You've gotten a new comment from %s.\n\n%s", name.String(), comment.String()),
		)

		if err != nil {
			log.Error("failed to send email", zap.Error(err))
		}

		log.Info("comment posted", zap.String("name", string(name)), zap.String("comment", string(comment)))

		http.Redirect(w, r, route.Root, http.StatusFound)
	})
}
