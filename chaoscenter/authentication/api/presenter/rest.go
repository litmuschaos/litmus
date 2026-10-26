package presenter

import "github.com/litmuschaos/litmus/chaoscenter/authentication/pkg/utils"

// ErrorResponseStruct defines the structure for error responses
type ErrorResponseStruct struct {
	Error            string `json:"error"`
	ErrorDescription string `json:"errorDescription"`
}

// CreateErrorResponse is a helper function that creates a ErrorResponseStruct
func CreateErrorResponse(appError utils.AppError) *ErrorResponseStruct {
	return &ErrorResponseStruct{
		Error:            appError.Error(),
		ErrorDescription: utils.ErrorDescriptions[appError],
	}
}
