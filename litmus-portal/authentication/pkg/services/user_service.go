package services

import (
	"litmus/litmus-portal/authentication/pkg/entities"
)

// Service creates a service for user authentication operations
type userService interface {
	LoginUser(user *entities.User) (*entities.User, error)
	GetUser(uid string) (*entities.User, error)
	GetUsers() (*[]entities.User, error)
	FindUsersByUID(uid []string) (*[]entities.User, error)
	FindUserByUsername(username string) (*entities.User, error)
	CheckPasswordHash(hash, password string) error
	UpdatePassword(userPassword *entities.UserPassword, isAdminBeingReset bool) error
	CreateUser(user *entities.User) (*entities.User, error)
	UpdateUser(user *entities.UserDetails) error
	IsAdministrator(user *entities.User) error
	UpdateUserState(username string, isDeactivate bool) error
}

// LoginUser is the implementation of the repository function `LoginUser`
func (s applicationService) LoginUser(user *entities.User) (*entities.User, error) {
	return s.userRepository.LoginUser(user)
}

// GetUser fetches user details for the given user id
func (s applicationService) GetUser(uid string) (*entities.User, error) {
	return s.userRepository.GetUser(uid)
}

// GetUsers fetches all the users from the database
func (s applicationService) GetUsers() (*[]entities.User, error) {
	return s.userRepository.GetUsers()
}

// FindUsersByUID fetches multiple users based on user ids
func (a applicationService) FindUsersByUID(uid []string) (*[]entities.User, error) {
	return a.userRepository.FindUsersByUID(uid)
}

// FindUser is the definition of finding an user from database
func (s applicationService) FindUserByUsername(username string) (*entities.User, error) {
	return s.userRepository.FindUserByUsername(username)
}

// CheckPasswordHash checks if hashed password matches with the input password
func (s applicationService) CheckPasswordHash(hash, password string) error {
	return s.userRepository.CheckPasswordHash(hash, password)
}

// UpdatePassword helps to update the password of the user, it acts as a resetPassword when isAdminBeingReset is set to true
func (s applicationService) UpdatePassword(userPassword *entities.UserPassword, isAdminBeingReset bool) error {
	return s.userRepository.UpdatePassword(userPassword, isAdminBeingReset)
}

// CreateUser creates a new user in the database
func (s applicationService) CreateUser(user *entities.User) (*entities.User, error) {
	return s.userRepository.CreateUser(user)
}

// UpdateUser updates user details in the database
func (s applicationService) UpdateUser(user *entities.UserDetails) error {
	return s.userRepository.UpdateUser(user)
}

// IsAdministrator verifies if the passed user is an administrator
func (s applicationService) IsAdministrator(user *entities.User) error {
	return s.userRepository.IsAdministrator(user)
}

// UpdateUserState updates deactivated_at state of the user
func (s applicationService) UpdateUserState(username string, isDeactivate bool) error {
	return s.userRepository.UpdateUserState(username, isDeactivate)
}

