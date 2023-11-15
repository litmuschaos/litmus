package response

import "github.com/gin-gonic/gin"

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
	Message string `json:"message" example:"Please ensure the password is 8 characters long and has 1 digit, 1 lowercase alphabet, 1 uppercase alphabet and 1 special character"`
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
