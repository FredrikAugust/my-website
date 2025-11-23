package handlers

import (
	"fmt"
	"net/http"
	"time"
	"website/storage"

	"github.com/go-chi/chi/v5"
	"go.uber.org/zap"

	"github.com/gorilla/feeds"
)

func Feeds(mux chi.Router, cms storage.CMSClient, logger *zap.Logger) {
	mux.Get("/feed.xml", func(w http.ResponseWriter, r *http.Request) {
		me := &feeds.Author{Name: "Fredrik August Madsen-Malmo", Email: "contact@fredrikmalmo.com"}

		feed := &feeds.Feed{
			Title:       "Fredrik's blog",
			Id:          "fredrik-augusts-technology-blog",
			Link:        &feeds.Link{Href: "https://fredrikmalmo.com/feed.xml", Rel: "self", Type: "application/atom+xml"},
			Description: "I write blogs about programming, photography, literature, food, and sometimes other things.",
			Author:      me,
			Updated:     time.Now().UTC(),
		}

		posts, err := cms.GetBlogPosts(r.Context())
		if err != nil {
			logger.Error("failed to get blog posts", zap.Error(err))
			http.Error(w, "failed to create atom feed", 500)
			return
		}

		feed.Items = make([]*feeds.Item, len(posts))
		for i, post := range posts {
			url := fmt.Sprintf("https://fredrikmalmo.com/blog/%s", post.Slug)
			feed.Items[i] = &feeds.Item{
				Id:      url,
				Title:   post.Title,
				Content: post.Excerpt,
				Created: post.PublishedAt.UTC(),
				Updated: post.UpdatedAt.UTC(),
				Source:  &feeds.Link{Href: url},
				Link:    &feeds.Link{Href: url},
			}
		}

		w.Header().Set("Content-Type", "application/atom+xml; charset=utf-8")
		w.Header().Set("Cache-Control", "public, max-age=300")

		err = feed.WriteAtom(w)

		if err != nil {
			logger.Error("could not write atom to http writer", zap.Error(err))
			http.Error(w, "failed to create atom feed", 500)
		}
	})
}
