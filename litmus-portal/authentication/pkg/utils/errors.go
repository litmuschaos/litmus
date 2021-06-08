package utils

import "errors"

//AppError defines general error's throughout the system
type AppError error

var (
	ErrInvalidCredentials AppError = errors.New("invalid_credentials")
	ErrServerError        AppError = errors.New("server_error")
	ErrInvalidRequest     AppError = errors.New("invalid_request")
	ErrUnauthorised       AppError = errors.New("unauthorised")
	ErrUserExists         AppError = errors.New("user_exists")
)

//ErrorStatusCodes holds the http status codes for every AppError
var ErrorStatusCodes = map[AppError]int{
	ErrInvalidRequest:     400,
	ErrInvalidCredentials: 401,
	ErrServerError:        500,
	ErrUnauthorised:       401,
	ErrUserExists:         401,
}

//ErrorDescriptions holds detailed error description for every AppError
var ErrorDescriptions = map[AppError]string{
	ErrServerError:        "The authorization server encountered an unexpected condition that prevented it from fulfilling the request",
	ErrInvalidCredentials: "Invalid Credentials",
	ErrInvalidRequest:     "The request is missing a required parameter, includes an invalid parameter value, includes a parameter more than once, or is otherwise malformed",
	ErrUnauthorised:       "The user does not have requested authorisation to access this resource",
	ErrUserExists:         "This username is already assigned to another user",
}
