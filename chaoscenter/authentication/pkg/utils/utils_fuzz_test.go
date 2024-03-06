package utils

import (
	"fmt"
	"testing"
)

func FuzzSanitizeString(f *testing.F) {
	f.Fuzz(func(t *testing.T, input string) {
		err := ValidateStrictPassword(input)
		if err != nil {
			if isExpectedError(err) {
				fmt.Printf("Expected validation failure for input '%s': %v\n", input, err)
			} else {
				fmt.Printf("Unexpected validation failure for input '%s': %v\n", input, err)
			}
		}
	})
}

func isExpectedError(err error) bool {
	expectedErrors := []string{
		"password is less than 8 characters",
		"password does not contain digits",
		"password does not contain lowercase alphabets",
		"password does not contain uppercase alphabets",
		"password does not contain special characters",
	}

	for _, expected := range expectedErrors {
		if err.Error() == expected {
			return true
		}
	}
	return false
}
