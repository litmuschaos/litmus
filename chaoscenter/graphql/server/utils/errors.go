package utils

import "errors"

// AppError defines general error's throughout the system
type AppError error

var (
	ErrDocumentExists AppError = errors.New("mongo_document_exists")
)

// ErrorStatusCodes holds the http status codes for every AppError
var ErrorStatusCodes = map[AppError]int{
	ErrDocumentExists: 401,
}

// ErrorDescriptions holds detailed error description for every AppError
var ErrorDescriptions = map[AppError]string{
	ErrDocumentExists: "This mongo document is already exist in the collection",
}
