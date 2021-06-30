package user

import "litmus/litmus-portal/authentication/pkg/entities"

// Service creates a service for user authentication operations
type Service interface {
	FindUser(username string) (*entities.User, error)
	CheckPasswordHash(hash, password string) error
	UpdatePassword(userPassword *entities.UserPassword, isAdminBeingReset bool) error
	CreateUser(user *entities.User) (*entities.User, error)
	UpdateUser(user *entities.User) (*entities.User, error)
	IsAdministrator(user *entities.User) error
	GetUsers() (*[]entities.User, error)
	UpdateUserState(username string, isDisable bool) error
}

type service struct {
	repository Repository
}

// FindUser is the definition of finding an user from database
func (s service) FindUser(username string) (*entities.User, error) {
	return s.repository.FindUser(username)
}

// CheckPasswordHash checks if hashed password matches with the input password
func (s service) CheckPasswordHash(hash, password string) error {
	return s.repository.CheckPasswordHash(hash, password)
}

// UpdatePassword helps to update the password of the user, it acts as a resetPassword when isAdminBeingReset is set to true
func (s service) UpdatePassword(userPassword *entities.UserPassword, isAdminBeingReset bool) error {
	return s.repository.UpdatePassword(userPassword, isAdminBeingReset)
}

// CreateUser creates a new user in the database
func (s service) CreateUser(user *entities.User) (*entities.User, error) {
	return s.repository.CreateUser(user)
}

// UpdateUser updates user details in the database
func (s service) UpdateUser(user *entities.User) (*entities.User, error) {
	return s.repository.UpdateUser(user)
}

// GetUsers fetches all the users from the database
func (s service) GetUsers() (*[]entities.User, error) {
	return s.repository.GetUsers()
}

// IsAdministrator verifies if the passed user is an administrator
func (s service) IsAdministrator(user *entities.User) error {
	return s.repository.IsAdministrator(user)
}

// RemoveUser updates removed_at state of the user
func (s service) UpdateUserState(username string, isDisable bool) error {
	return s.repository.UpdateUserState(username, isDisable)
}

// NewService creates a new instance of this service
func NewService(r Repository) Service {
	return &service{
		repository: r,
	}
}
