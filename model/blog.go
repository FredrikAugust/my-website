package model

import (
	"time"
	"website/richtext"
)

type BlogPostStatus string

const (
	StatusDraft = BlogPostStatus("draft")
)

type BlogPost struct {
	ID            int               `json:"id"`
	Title         string            `json:"title"`
	Slug          string            `json:"slug"`
	PublishedAt   time.Time         `json:"publishedAt"`
	Status        BlogPostStatus    `json:"status"`
	Excerpt       string            `json:"excerpt"`
	FeaturedImage *Photo            `json:"featuredImage"`
	Content       richtext.RootNode `json:"content"`

	Tags []struct {
		Id  string `json:"id"`
		Tag string `json:"tag"`
	} `json:"tags"`

	UpdatedAt time.Time `json:"updatedAt"`
	CreatedAt time.Time `json:"createdAt"`
}
