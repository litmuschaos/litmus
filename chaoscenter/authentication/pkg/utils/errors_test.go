package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestErrorStatusCodes(t *testing.T) {
	// Verify critical error codes are properly configured
	assert.Equal(t, 400, ErrorStatusCodes[ErrInvalidRequest])
	assert.Equal(t, 401, ErrorStatusCodes[ErrInvalidCredentials])
	assert.Equal(t, 500, ErrorStatusCodes[ErrServerError])
	assert.Equal(t, 401, ErrorStatusCodes[ErrUnauthorized])
	assert.Equal(t, 401, ErrorStatusCodes[ErrStrictPasswordPolicyViolation])
	assert.Equal(t, 401, ErrorStatusCodes[ErrStrictUsernamePolicyViolation])
	assert.Equal(t, 400, ErrorStatusCodes[ErrUserNotFound])
	assert.Equal(t, 400, ErrorStatusCodes[ErrProjectNotFound])
	assert.Equal(t, 400, ErrorStatusCodes[ErrUserDeactivated])

	// Ensure all entries in ErrorStatusCodes map have standard HTTP error status codes (4xx or 5xx)
	for appErr, code := range ErrorStatusCodes {
		assert.GreaterOrEqual(t, code, 400, "error status code for %v should be >= 400", appErr)
		assert.Less(t, code, 600, "error status code for %v should be < 600", appErr)
	}
}

func TestErrorDescriptions(t *testing.T) {
	// Ensure descriptions are non-empty for all configured errors
	for appErr, desc := range ErrorDescriptions {
		assert.NotEmpty(t, desc, "error description for %v should not be empty", appErr)
	}

	assert.Contains(t, ErrorDescriptions[ErrStrictPasswordPolicyViolation], "atleast 8 characters long")
	assert.Contains(t, ErrorDescriptions[ErrStrictUsernamePolicyViolation], "at least 3 characters long")
}
