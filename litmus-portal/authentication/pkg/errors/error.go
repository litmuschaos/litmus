package errors

import "errors"

// known errors
var (
	ErrInvalidRedirectURI = errors.New("invalid redirect uri")
	ErrInvalidAccessToken = errors.New("invalid access token")
	ErrExpiredAccessToken = errors.New("expired access token")
)
