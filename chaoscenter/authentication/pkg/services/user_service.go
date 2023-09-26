package services

import (
	"context"

	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
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
	UpdateUserState(ctx context.Context, username string, isDeactivate bool, deactivateTime int64) error
	InviteUsers(invitedUsers []string) (*[]entities.User, error)
}

// LoginUser is the implementation of the repository function `LoginUser`
func (a applicationService) LoginUser(user *entities.User) (*entities.User, error) {
	return a.userRepository.LoginUser(user)
}

// GetUser fetches user details for the given user id
func (a applicationService) GetUser(uid string) (*entities.User, error) {
	return a.userRepository.GetUser(uid)
}

// GetUsers fetches all the users from the database
func (a applicationService) GetUsers() (*[]entities.User, error) {
	return a.userRepository.GetUsers()
}

// FindUsersByUID fetches multiple users based on user ids
func (a applicationService) FindUsersByUID(uid []string) (*[]entities.User, error) {
	return a.userRepository.FindUsersByUID(uid)
}

// FindUserByUsername is the definition of finding an user from database
func (a applicationService) FindUserByUsername(username string) (*entities.User, error) {
	return a.userRepository.FindUserByUsername(username)
}

// CheckPasswordHash checks if hashed password matches with the input password
func (a applicationService) CheckPasswordHash(hash, password string) error {
	return a.userRepository.CheckPasswordHash(hash, password)
}

// UpdatePassword helps to update the password of the user, it acts as a resetPassword when isAdminBeingReset is set to true
func (a applicationService) UpdatePassword(userPassword *entities.UserPassword, isAdminBeingReset bool) error {
	return a.userRepository.UpdatePassword(userPassword, isAdminBeingReset)
}

// CreateUser creates a new user in the database
func (a applicationService) CreateUser(user *entities.User) (*entities.User, error) {
	return a.userRepository.CreateUser(user)
}

// UpdateUser updates user details in the database
func (a applicationService) UpdateUser(user *entities.UserDetails) error {
	return a.userRepository.UpdateUser(user)
}

// IsAdministrator verifies if the passed user is an administrator
func (a applicationService) IsAdministrator(user *entities.User) error {
	return a.userRepository.IsAdministrator(user)
}

// UpdateUserState updates deactivated_at state of the user
func (a applicationService) UpdateUserState(ctx context.Context, username string, isDeactivate bool, deactivateTime int64) error {
	return a.userRepository.UpdateUserState(ctx, username, isDeactivate, deactivateTime)
}

func (a applicationService) InviteUsers(invitedUsers []string) (*[]entities.User, error) {
	return a.userRepository.InviteUsers(invitedUsers)
}
