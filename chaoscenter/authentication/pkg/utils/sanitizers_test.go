package utils

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSanitizeString(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "string with leading and trailing spaces",
			input:    "   litmus chaos   ",
			expected: "litmus chaos",
		},
		{
			name:     "string with tabs and newlines",
			input:    "\t\n  litmus\n\t",
			expected: "litmus",
		},
		{
			name:     "already trimmed string",
			input:    "admin",
			expected: "admin",
		},
		{
			name:     "empty string",
			input:    "",
			expected: "",
		},
		{
			name:     "only whitespace",
			input:    "   \t\n   ",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := SanitizeString(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestValidateStrictPassword(t *testing.T) {
	tests := []struct {
		name        string
		password    string
		expectError bool
		errorMsg    string
	}{
		{
			name:        "valid password with @ symbol",
			password:    "Password1@",
			expectError: false,
		},
		{
			name:        "valid password with multiple special chars",
			password:    "Admin#2026_test",
			expectError: false,
		},
		{
			name:        "valid password with max length 16",
			password:    "Aa1!Bb2@Cc3#Dd4$",
			expectError: false,
		},
		{
			name:        "valid password with min length 8",
			password:    "A1@b2#C3",
			expectError: false,
		},
		{
			name:        "password length less than 8",
			password:    "Pass1@",
			expectError: true,
			errorMsg:    "password length is less than 8 characters",
		},
		{
			name:        "empty password",
			password:    "",
			expectError: true,
			errorMsg:    "password length is less than 8 characters",
		},
		{
			name:        "password length greater than 16",
			password:    "VeryLongPassword12345@!",
			expectError: true,
			errorMsg:    "password length is more than 16 characters",
		},
		{
			name:        "password missing digits",
			password:    "Password@#$",
			expectError: true,
			errorMsg:    "password does not contain digits",
		},
		{
			name:        "password missing lowercase alphabets",
			password:    "PASSWORD123@#$",
			expectError: true,
			errorMsg:    "password does not contain lowercase alphabets",
		},
		{
			name:        "password missing uppercase alphabets",
			password:    "password123@#$",
			expectError: true,
			errorMsg:    "password does not contain uppercase alphabets",
		},
		{
			name:        "password missing special characters",
			password:    "Password1234",
			expectError: true,
			errorMsg:    "password does not contain special characters",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateStrictPassword(tt.password)
			if tt.expectError {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.errorMsg)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestRandomString(t *testing.T) {
	t.Run("generate random string with valid positive length", func(t *testing.T) {
		str1, err1 := RandomString(16)
		assert.NoError(t, err1)
		assert.NotEmpty(t, str1)

		str2, err2 := RandomString(16)
		assert.NoError(t, err2)
		assert.NotEmpty(t, str2)

		// Two random strings should not be identical
		assert.NotEqual(t, str1, str2)
	})

	t.Run("error when length is 0", func(t *testing.T) {
		str, err := RandomString(0)
		assert.Error(t, err)
		assert.Empty(t, str)
		assert.Equal(t, "length should be greater than 0", err.Error())
	})

	t.Run("error when length is negative", func(t *testing.T) {
		str, err := RandomString(-5)
		assert.Error(t, err)
		assert.Empty(t, str)
		assert.Equal(t, "length should be greater than 0", err.Error())
	})
}

func TestValidateStrictUsername(t *testing.T) {
	tests := []struct {
		name        string
		username    string
		expectError bool
	}{
		{
			name:        "valid alphanumeric username",
			username:    "admin123",
			expectError: false,
		},
		{
			name:        "valid username with dot, underscore, dash",
			username:    "john.doe_test-01",
			expectError: false,
		},
		{
			name:        "valid email username for Dex SSO",
			username:    "user@litmuschaos.io",
			expectError: false,
		},
		{
			name:        "valid email username with plus tag",
			username:    "user+chaos@example.com",
			expectError: false,
		},
		{
			name:        "valid username at min length 3",
			username:    "usr",
			expectError: false,
		},
		{
			name:        "valid username at max length 254",
			username:    "a" + strings.Repeat("b", 253),
			expectError: false,
		},
		{
			name:        "error when username length is less than 3",
			username:    "ab",
			expectError: true,
		},
		{
			name:        "error when username is empty",
			username:    "",
			expectError: true,
		},
		{
			name:        "error when username length exceeds 254",
			username:    "a" + strings.Repeat("b", 254),
			expectError: true,
		},
		{
			name:        "error when username starts with a special character dot",
			username:    ".admin",
			expectError: true,
		},
		{
			name:        "error when username starts with an @",
			username:    "@admin",
			expectError: true,
		},
		{
			name:        "error when username contains spaces",
			username:    "admin user",
			expectError: true,
		},
		{
			name:        "error when username contains unpermitted characters",
			username:    "admin#user",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateStrictUsername(tt.username)
			if tt.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
