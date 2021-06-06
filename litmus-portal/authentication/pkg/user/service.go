package user

import "litmus/litmus-portal/authentication/pkg/entities"

type Service interface {
	FindUser(user *entities.User) (*entities.User, error)
	UpdatePassword(userPassword *entities.UserPassword, isAdminBeingReset bool) error
	CreateUser(user *entities.User) (*entities.User, error)
	UpdateUser(user *entities.User) (*entities.User, error)
	IsAdministrator(user *entities.User) error
	GetUsers() (*[]entities.User, error)
}

type service struct {
	repository Repository
}

func (s service) FindUser(user *entities.User) (*entities.User, error) {
	return s.repository.FindUser(user)
}

func (s service) UpdatePassword(userPassword *entities.UserPassword, isAdminBeingReset bool) error {
	return s.repository.UpdatePassword(userPassword, isAdminBeingReset)
}

func (s service) CreateUser(user *entities.User) (*entities.User, error) {
	return s.repository.CreateUser(user)
}

func (s service) UpdateUser(user *entities.User) (*entities.User, error) {
	return s.repository.UpdateUser(user)
}

func (s service) GetUsers() (*[]entities.User, error) {
	return s.repository.GetUsers()
}

func (s service) IsAdministrator(user *entities.User) error {
	return s.repository.IsAdministrator(user)
}

func NewService(r Repository) Service {
	return &service{
		repository: r,
	}
}
