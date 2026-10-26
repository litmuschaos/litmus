package services

// Service creates a service for user authentication operations
type miscService interface {
	ListCollection() ([]string, error)
	ListDataBase() ([]string, error)
}

func (a applicationService) ListCollection() ([]string, error) {
	return a.miscRepository.ListCollection()
}

func (a applicationService) ListDataBase() ([]string, error) {
	return a.miscRepository.ListDataBase()
}
