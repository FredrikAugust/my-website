package entities

import "time"

type ViewCount struct {
	Hostname    string
	Views       int
	LastUpdated time.Time
}

func NewViewCount(hostname string) *ViewCount {
	return &ViewCount{
		Hostname:    hostname,
		Views:       1,
		LastUpdated: time.Now(),
	}
}

func (vc *ViewCount) Increment() {
	vc.Views++
	vc.LastUpdated = time.Now()
}