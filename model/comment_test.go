package model_test

import (
	"testing"

	. "website/model"
)

func TestComment_IsValid(t *testing.T) {
	tests := []struct {
		comment Comment
		want    bool
	}{
		{Comment("Valid comment"), true},
		{Comment("Valid comment with a longer text"), true},
		{Comment("Valid comment with a very long text that doesn't exceed the maximum length"), true},
		{Comment(""), false},
	}

	for _, tt := range tests {
		t.Run(string(tt.comment), func(t *testing.T) {
			if got := tt.comment.IsValid(); got != tt.want {
				t.Errorf("IsValid() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestName_IsValid(t *testing.T) {
	tests := []struct {
		name Name
		want bool
	}{
		{Name("fredrik"), true},
		{Name(""), false},
		{Name("a way too long name that will surely fail due to length restrictions or so i think at least a way too long name that will surely fail due to length restrictions or so i think at least"), false},
	}

	for _, tt := range tests {
		t.Run(string(tt.name), func(t *testing.T) {
			if got := tt.name.IsValid(); got != tt.want {
				t.Errorf("IsValid() = %v, want %v", got, tt.want)
			}
		})
	}
}
