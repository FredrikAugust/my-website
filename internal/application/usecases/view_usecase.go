package usecases

import (
	"time"
	"github.com/fredrikaugust/website/internal/application/interfaces"
)

type ViewUsecase struct {
	viewRepo interfaces.ViewRepository
}

type PageData struct {
	DateTime      string
	VisitorNumber int
	Hostname      string
}

func NewViewUsecase(viewRepo interfaces.ViewRepository) *ViewUsecase {
	return &ViewUsecase{
		viewRepo: viewRepo,
	}
}

func (vu *ViewUsecase) GetPageData() (*PageData, error) {
	hostname, err := vu.viewRepo.GetHostname()
	if err != nil {
		hostname = "unknown"
	}

	err = vu.viewRepo.IncrementViewCountForHostname(hostname)
	if err != nil {
		return nil, err
	}

	viewCount, err := vu.viewRepo.GetViewsForHostname(hostname)
	if err != nil {
		return nil, err
	}

	return &PageData{
		DateTime:      time.Now().Format("Jan 2nd, 2006 15:04"),
		VisitorNumber: viewCount,
		Hostname:      hostname,
	}, nil
}