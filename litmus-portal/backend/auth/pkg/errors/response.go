package errors

import (
	"errors"
	"net/http"
)

// Define alias
var (
	New = errors.New
)

// Response error response
type Response struct {
	Error       error
	ErrorCode   int
	Description string
	URI         string
	StatusCode  int
	Header      http.Header
}

// NewResponse create the response pointer
func NewResponse(err error, statusCode int) *Response {
	return &Response{
		Error:      err,
		StatusCode: statusCode,
	}
}

// SetHeader sets the header entries associated with key to
// the single element value.
func (r *Response) SetHeader(key, value string) {
	if r.Header == nil {
		r.Header = make(http.Header)
	}
	r.Header.Set(key, value)
}

// https://tools.ietf.org/html/rfc6749#section-5.2
var (
	ErrInvalidRequest         = errors.New("invalid_request")
	ErrServerError            = errors.New("server_error")
	ErrTemporarilyUnavailable = errors.New("temporarily_unavailable")
	ErrInvalidUser            = errors.New("invalid_user")
	ErrInvalidPassword        = errors.New("invalid_password")
)

// Descriptions error description
var Descriptions = map[error]string{
	ErrInvalidRequest:         "The request is missing a required parameter, includes an invalid parameter value, includes a parameter more than once, or is otherwise malformed",
	ErrServerError:            "The authorization server encountered an unexpected condition that prevented it from fulfilling the request",
	ErrTemporarilyUnavailable: "The authorization server is currently unable to handle the request due to a temporary overloading or maintenance of the server",
	ErrInvalidUser:            "User does not exist",
	ErrInvalidPassword:        "User authentication failed",
}

// StatusCodes response error HTTP status code
var StatusCodes = map[error]int{
	ErrInvalidRequest:         400,
	ErrServerError:            500,
	ErrTemporarilyUnavailable: 503,
	ErrInvalidUser:            401,
	ErrInvalidPassword:        401,
}
