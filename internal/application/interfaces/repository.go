package interfaces

type ViewRepository interface {
	GetHostname() (string, error)
	GetViewsForHostname(hostname string) (int, error)
	IncrementViewCountForHostname(hostname string) error
}

