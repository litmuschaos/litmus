package response

import (
	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/entities"
)

type Response struct {
	Response string
}

type ApiTokenResponse struct {
	UserID    string
	Name      string
	Token     string
	ExpiresAt int64
	CreatedAt int64
}

type Role string
type UserResponse struct {
	ID            string `bson:"_id,omitempty" json:"userID"`
	Username      string `bson:"username,omitempty" json:"username"`
	Password      string `bson:"password,omitempty" json:"password,omitempty"`
	Email         string `bson:"email,omitempty" json:"email,omitempty"`
	Name          string `bson:"name,omitempty" json:"name,omitempty"`
	Role          Role   `bson:"role,omitempty" json:"role"`
	DeactivatedAt *int64 `bson:"deactivated_at,omitempty" json:"deactivatedAt,omitempty"`
}

type CapabilitiesResponse struct {
	Dex struct {
		Enabled bool `json:"enabled"`
	} `json:"dex"`
}

type MessageResponse struct {
	Message string
}

type NewApiToken struct {
	accessToken string
}

type LoginResponse struct {
	accessToken string
	projectID   string
	projectRole string
	expiresIn   string
}

// HTTPError example

func NewError(ctx *gin.Context, status int, err error) {
	er := HTTPError{
		Code:    status,
		Message: err.Error(),
	}
	ctx.JSON(status, er)
}

type HTTPError struct {
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"status bad request"`
}

type ErrServerError struct {
	Code    int    `json:"code" example:"500"`
	Message string `json:"message" example:"The authorization server encountered an unexpected condition that prevented it from fulfilling the request"`
}
type ErrInvalidCredentials struct {
	Code    int    `json:"code" example:"401"`
	Message string `json:"message" example:"Invalid Credentials"`
}

type ErrInvalidRequest struct {
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"The request is missing a required parameter, includes an invalid parameter value, includes a parameter more than once, or is otherwise malformed"`
}

type ErrOldPassword struct {
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"The old and new passwords can't be same"`
}

type ErrUnauthorized struct {
	Code    int    `json:"code" example:"401"`
	Message string `json:"message" example:"The user does not have requested authorization to access this resource"`
}

type ErrUserExists struct {
	Code    int    `json:"code" example:"401"`
	Message string `json:"message" example:"This username is already assigned to another user"`
}

type ErrUserNotFound struct {
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"user does not exist"`
}

type ErrUserDeactivated struct {
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"your account has been deactivated"`
}

type ErrStrictPasswordPolicyViolation struct {
	Code    int    `json:"code" example:"401"`
	Message string `json:"message" example:"Please ensure the password is atleast 8 characters and atmost 16 characters long and has atleast 1 digit, 1 lowercase alphabet, 1 uppercase alphabet and 1 special character"`
}

type ErrStrictUsernamePolicyViolation struct {
	Code    int    `json:"code" example:"401"`
	Message string `json:"message" example:"The username should be atleast 3 characters long and atmost 16 characters long."`
}

type ErrEmptyProjectName struct {
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"Project name can't be empty"`
}

type ErrInvalidRole struct {
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"Role is invalid"`
}

type ErrProjectNotFound struct {
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"This project does not exist"`
}

type ErrInvalidEmail struct {
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"Email address is invalid"`
}

type ErrProjectNotFoundstruct struct {
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"project does not exist"`
}

type ReadinessAPIStatus struct {
	DataBase    string `json:"database"`
	Collections string `json:"collections"`
}

type APIStatus struct {
	Status string `json:"status"`
}

type UserWithProject struct {
	Data entities.UserWithProject `json:"data"`
}

type Project struct {
	Data entities.Project `json:"data"`
}

type Projects struct {
	Data []*entities.Project `json:"data"`
}

type ListProjectResponse struct {
	Data entities.ListProjectResponse `json:"data"`
}

type ProjectStats struct {
	Data []*entities.ProjectStats `json:"data"`
}

type Members struct {
	Data []*entities.Member `json:"data"`
}

type Member struct {
	Data entities.Member `json:"data"`
}

type ListInvitationResponse struct {
	Data []entities.ListInvitationResponse `json:"data"`
}

type ProjectRole struct {
	Role string `json:"role"`
}

type ProjectIDWithMessage struct {
	ProjectID string `json:"projectID"`
	Message   string `json:"message"`
}
