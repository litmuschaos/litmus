package utils

import "errors"

type AppError error

var (
	ErrInvalidCredentials AppError = errors.New("invalid_credentials")
	ErrServerError        AppError = errors.New("server_error")
	ErrInvalidRequest     AppError = errors.New("invalid_request")
	ErrUnauthorised       AppError = errors.New("unauthorised")
)

var ErrorStatusCodes = map[AppError]int{
	ErrInvalidRequest:     400,
	ErrInvalidCredentials: 401,
	ErrServerError:        500,
	ErrUnauthorised:       401,
}

var ErrorDescriptions = map[AppError]string{
	ErrServerError:        "The authorization server encountered an unexpected condition that prevented it from fulfilling the request",
	ErrInvalidCredentials: "Invalid Credentials",
	ErrInvalidRequest:     "The request is missing a required parameter, includes an invalid parameter value, includes a parameter more than once, or is otherwise malformed",
	ErrUnauthorised:       "The user does not have requested authorisation to access this resource",
}
