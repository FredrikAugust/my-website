package handlers

import (
	"context"
	"net/http"
	"strconv"

	"website/model"
	"website/security"
	"website/storage"
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

func FrontPage(mux chi.Router, g guestbookGetter, cmsClient storage.CMSClient, logger *zap.Logger, turnstileOptions *security.TurnstileFrontendOptions) {
	mux.Get("/", func(w http.ResponseWriter, r *http.Request) {
		comments, err := g.GetComments(r.Context())
		if err != nil {
			logger.Warn("failed to fetch guestbook comments", zap.Error(err))
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		logger.Info("guestbook comments fetched successfully", zap.Int("count", len(comments)))

		recentPhotos, err := cmsClient.GetRecentPhotos(r.Context())
		if err != nil {
			logger.Warn("failed to get recent photos", zap.Error(err))
			recentPhotos = make([]model.Photo, 0)
		}

		recentBlogPosts, err := cmsClient.GetRecentBlogPosts(r.Context())
		if err != nil {
			logger.Warn("failed to get recent blog posts", zap.Error(err))
			recentBlogPosts = make([]model.BlogPost, 0)
		}

		_ = views.FrontPage(r.Context().Value("authenticated").(bool), comments, turnstileOptions.Sitekey, recentPhotos, recentBlogPosts).Render(w)
	})
}

type photoGetter interface {
	GetAlbums(ctx context.Context) ([]model.Album, error)
	GetAlbumWithPhotos(ctx context.Context, albumID int) (model.AlbumWithPhotos, error)
}

func Photography(mux chi.Router, p photoGetter, logger *zap.Logger) {
	mux.Get(route.Albums, func(w http.ResponseWriter, r *http.Request) {
		albums, err := p.GetAlbums(r.Context())
		if err != nil {
			logger.Warn("failed to fetch photos", zap.Error(err))
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		_ = views.Albums(albums, r.Context().Value("authenticated").(bool)).Render(w)
	})

	mux.Get("/albums/{albumId:[0-9]+}", func(w http.ResponseWriter, r *http.Request) {
		albumID, err := strconv.Atoi(chi.URLParam(r, "albumId"))
		if err != nil {
			logger.Warn("failed to parse album ID", zap.Error(err))
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		album, err := p.GetAlbumWithPhotos(r.Context(), albumID)
		if err != nil {
			logger.Warn("failed to fetch photos", zap.Error(err))
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		_ = views.Album(albumID, album, r.Context().Value("authenticated").(bool)).Render(w)
	})
}

func Blog(mux chi.Router, cms storage.CMSClient, logger *zap.Logger) {
	mux.Get(route.Blog, func(w http.ResponseWriter, r *http.Request) {
		blogPosts, err := cms.GetBlogPosts(r.Context())
		if err != nil {
			logger.Warn("failed to get blog posts", zap.Error(err))
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		_ = views.Blog(r.Context().Value("authenticated").(bool), blogPosts).Render(w)
	})

	mux.Get("/blog/{slug}", func(w http.ResponseWriter, r *http.Request) {
		blogPost, err := cms.GetBlogPost(r.Context(), chi.URLParam(r, "slug"))
		if err != nil {
			logger.Warn("failed to fetch blog post", zap.Error(err))
			http.NotFound(w, r)
			return
		}

		_ = views.BlogPost(r.Context().Value("authenticated").(bool), blogPost).Render(w)
	})
}

func Login(mux chi.Router) {
	mux.Get(route.Login, func(w http.ResponseWriter, r *http.Request) {
		_ = views.Login(r.Context().Value("authenticated").(bool)).Render(w)
	})
}
