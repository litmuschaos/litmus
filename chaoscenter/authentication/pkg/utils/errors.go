package utils

import "errors"

// AppError defines general error's throughout the system
type AppError error

var (
	ErrInvalidCredentials            AppError = errors.New("invalid_credentials")
	ErrServerError                   AppError = errors.New("server_error")
	ErrInvalidRequest                AppError = errors.New("invalid_request")
	ErrStrictPasswordPolicyViolation AppError = errors.New("password_policy_violation")
	ErrStrictUsernamePolicyViolation AppError = errors.New("username_policy_violation")
	ErrUnauthorized                  AppError = errors.New("unauthorized")
	ErrUserExists                    AppError = errors.New("user_exists")
	ErrUserNotFound                  AppError = errors.New("user does not exist")
	ErrProjectNotFound               AppError = errors.New("project does not exist")
	ErrWrongPassword                 AppError = errors.New("password doesn't match")
	ErrUpdatingAdmin                 AppError = errors.New("cannot remove admin")
	ErrUserDeactivated               AppError = errors.New("your account has been deactivated")
	ErrUserAlreadyDeactivated        AppError = errors.New("user already deactivated")
	ErrEmptyProjectName              AppError = errors.New("invalid project name")
	ErrInvalidRole                   AppError = errors.New("invalid role")
	ErrInvalidEmail                  AppError = errors.New("invalid email")
	ErrPasswordNotUpdated            AppError = errors.New("default password not updated")
	ErrOldPassword                   AppError = errors.New("old and new passwords can't be same")
	ErrLastProjectOwner              AppError = errors.New("cannot remove the only owner of the project")
)

// ErrorStatusCodes holds the http status codes for every AppError
var ErrorStatusCodes = map[AppError]int{
	ErrInvalidRequest:                400,
	ErrInvalidCredentials:            401,
	ErrServerError:                   500,
	ErrUnauthorized:                  401,
	ErrUserExists:                    401,
	ErrStrictPasswordPolicyViolation: 401,
	ErrStrictUsernamePolicyViolation: 401,
	ErrUserNotFound:                  400,
	ErrProjectNotFound:               400,
	ErrUpdatingAdmin:                 400,
	ErrUserDeactivated:               400,
	ErrUserAlreadyDeactivated:        400,
	ErrEmptyProjectName:              400,
	ErrInvalidRole:                   400,
	ErrInvalidEmail:                  400,
	ErrPasswordNotUpdated:            401,
	ErrOldPassword:                   400,
	ErrLastProjectOwner:              400,
}

// ErrorDescriptions holds detailed error description for every AppError
var ErrorDescriptions = map[AppError]string{
	ErrServerError:                   "The authorization server encountered an unexpected condition that prevented it from fulfilling the request",
	ErrInvalidCredentials:            "Invalid Credentials",
	ErrInvalidRequest:                "The request is missing a required parameter, includes an invalid parameter value, includes a parameter more than once, or is otherwise malformed",
	ErrUnauthorized:                  "The user does not have requested authorization to access this resource",
	ErrUserExists:                    "This username is already assigned to another user",
	ErrStrictPasswordPolicyViolation: "Please ensure the password is atleast 8 characters long and atmost 16 characters long and has atleast 1 digit, 1 lowercase alphabet, 1 uppercase alphabet and 1 special character",
	ErrStrictUsernamePolicyViolation: "The username should be atleast 3 characters long and atmost 16 characters long.",
	ErrEmptyProjectName:              "Project name can't be empty",
	ErrInvalidRole:                   "Role is invalid",
	ErrProjectNotFound:               "This project does not exist",
	ErrInvalidEmail:                  "Email address is invalid",
	ErrPasswordNotUpdated:            "Please update your default password",
	ErrOldPassword:                   "old and new passwords can't be same",
	ErrLastProjectOwner:              "Cannot remove the only owner of the project",
}
