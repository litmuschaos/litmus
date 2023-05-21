package presenter

import "litmus/litmus-portal/authentication/pkg/utils"

//ErrorResponseStruct defines the structure for error responses
type ErrorResponseStruct struct {
	Error            string `json:"error"`
	ErrorDescription string `json:"error_description"`
}

//CreateErrorResponse is a helper function that creates a ErrorResponseStruct
func CreateErrorResponse(appError utils.AppError) *ErrorResponseStruct {
	return &ErrorResponseStruct{
		Error:            appError.Error(),
		ErrorDescription: utils.ErrorDescriptions[appError],
	}
}
