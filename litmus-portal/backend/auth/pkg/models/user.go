package models

import (
	"time"

	"github.com/litmuschaos/litmus/litmus-portal/backend/auth/pkg/types"
)

//UserCredentials contains the user information
type UserCredentials struct {
	ID       string `bson:"_id"`
	UserName string `bson:"username"`
	Password string `bson:"password"`
	Email    string `bson:"email"`
	Name     string `bson:"name"`
	// UserID		string       `bson:"user_id"`
	LoggedIn    bool         `bson:"logged_in"`
	SocialAuths []SocialAuth `bson:"social_auths"`
	CreatedAt   *time.Time   `bson:"created_at"`
	UpdatedAt   *time.Time   `bson:"updated_at"`
	RemovedAt   *time.Time   `bson:"removed_at"`
	State       State        `bson:"state"`
}

//DefaultUser is the admin user created by default
var DefaultUser *UserCredentials = &UserCredentials{
	UserName: types.DefaultUserName,
	Password: types.DefaultUserPassword,
}

//PublicUserInfo displays the information of the user that is publicly available
type PublicUserInfo struct {
	ID        string     `json:"_id"`
	UserName  string     `json:"username"`
	Email     string     `json:"email"`
	Name      string     `json:"name"`
	LoggedIn  bool       `json:"logged_in"`
	CreatedAt *time.Time `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at"`
	RemovedAt *time.Time `json:"removed_at"`
	State     State      `json:"state"`
}

//SocialAuth contains the oauth types and related information opted by the user
type SocialAuth struct {
	Type         string     `bson:"type"`
	AccessToken  string     `bson:"access_token"`
	RefreshToken string     `bson:"refresh_token"`
	Expiry       *time.Time `bson:"expiry"`
	TokenType    string     `bson:"token_type"`
}

//State is the current state of the database entry of the user
type State string

const (
	//StateCreating means this entry is being created yet
	StateCreating State = "creating"
	//StateActive means this entry is active
	StateActive State = "active"
	//StateRemoving means this entry is being removed
	StateRemoving State = "removing"
	//StateRemoved means this entry has been removed
	StateRemoved State = "removed"
)

// GetID user id
func (u *UserCredentials) GetID() string {
	return u.ID
}

// GetUserName user username
func (u *UserCredentials) GetUserName() string {
	return u.UserName
}

// GetPassword user password
func (u *UserCredentials) GetPassword() string {
	return u.Password
}

// GetEmail user email
func (u *UserCredentials) GetEmail() string {
	return u.Email
}

// GetName returns user name
func (u *UserCredentials) GetName() string {
	return u.Name
}

// GetSocialAuths returns all the social authentications of the user
func (u *UserCredentials) GetSocialAuths() []SocialAuth {
	return u.SocialAuths
}

// GetCreatedAt defines the time at which this user was created
func (u *UserCredentials) GetCreatedAt() *time.Time {
	return u.CreatedAt
}

// GetUpdatedAt defines the time at which user was last updated
func (u *UserCredentials) GetUpdatedAt() *time.Time {
	return u.UpdatedAt
}

// GetRemovedAt defines the time at which this user was removed
func (u *UserCredentials) GetRemovedAt() *time.Time {
	return u.RemovedAt
}

// GetState user password
func (u *UserCredentials) GetState() State {
	return u.State
}

// GetLoggedIn user password
func (u *UserCredentials) GetLoggedIn() bool {
	return u.LoggedIn
}

// GetPublicInfo fetches the pubicUserInfo from User
func (u *UserCredentials) GetPublicInfo() *PublicUserInfo {
	return &PublicUserInfo{
		Name:      u.GetName(),
		UserName:  u.GetUserName(),
		Email:     u.GetEmail(),
		ID:        u.GetID(),
		LoggedIn:  u.GetLoggedIn(),
		CreatedAt: u.GetCreatedAt(),
		UpdatedAt: u.GetUpdatedAt(),
		RemovedAt: u.GetRemovedAt(),
		State:     u.GetState(),
	}
}

// GetUserName user username
func (uinfo *PublicUserInfo) GetUserName() string {
	return uinfo.UserName
}

// GetName user username
func (uinfo *PublicUserInfo) GetName() string {
	return uinfo.Name
}

// GetEmail user email
func (uinfo *PublicUserInfo) GetEmail() string {
	return uinfo.Email
}

// GetCreatedAt user createdAt
func (uinfo *PublicUserInfo) GetCreatedAt() *time.Time {
	return uinfo.CreatedAt
}

// GetID user ID
func (uinfo *PublicUserInfo) GetID() string {
	return uinfo.ID
}

// GetLoggedIn user loggedIn
func (uinfo *PublicUserInfo) GetLoggedIn() bool {
	return uinfo.LoggedIn
}

// GetUpdatedAt user updatedAt
func (uinfo *PublicUserInfo) GetUpdatedAt() *time.Time {
	return uinfo.UpdatedAt
}

// GetRemovedAt user removedAt
func (uinfo *PublicUserInfo) GetRemovedAt() *time.Time {
	return uinfo.RemovedAt
}

// GetState user state
func (uinfo *PublicUserInfo) GetState() State {
	return uinfo.State
}

// GetType returns auth type
func (s *SocialAuth) GetType() string {
	return s.Type
}

// GetAccessToken returns auth token
func (s *SocialAuth) GetAccessToken() string {
	return s.AccessToken
}

// GetRefreshToken returns refresh token
func (s *SocialAuth) GetRefreshToken() string {
	return s.RefreshToken
}

// GetTokenType returns token type
func (s *SocialAuth) GetTokenType() string {
	return s.TokenType
}

// GetExpiry returns auth type
func (s *SocialAuth) GetExpiry() *time.Time {
	return s.Expiry
}
