package presenter

import "litmus/litmus-portal/authentication/pkg/utils"

type ErrorResponseStruct struct {
	Error            string `json:"error"`
	ErrorDescription string `json:"error_description"`
}

func CreateErrorResponse(appError utils.AppError) *ErrorResponseStruct {
	return &ErrorResponseStruct{
		Error:            appError.Error(),
		ErrorDescription: utils.ErrorDescriptions[appError],
	}
}
