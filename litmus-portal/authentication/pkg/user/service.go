package user

import "litmus/litmus-portal/authentication/pkg/entities"

type Service interface {
	LoginUser(user *entities.User) (*entities.User, error)
	UpdatePassword(username string, currentPassword string, oldPassword string) error
	ResetPassword(username string, password string) error
	CreateUser(user *entities.User) (*entities.User, error)
	UpdateUser(user *entities.User) (*entities.User, error)
	GetUsers() (*[]entities.User, error)
}

type service struct {
	repository Repository
}

func (s service) LoginUser(user *entities.User) (*entities.User, error) {
	return s.repository.LoginUser(user)
}

func (s service) UpdatePassword(username string, currentPassword string, oldPassword string) error {
	return s.repository.UpdatePassword(username, currentPassword, oldPassword)
}

func (s service) ResetPassword(username string, password string) error {
	return s.repository.ResetPassword(username, password)
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

func NewService(r Repository) Service {
	return &service{
		repository: r,
	}
}
