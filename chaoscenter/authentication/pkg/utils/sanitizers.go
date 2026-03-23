package utils

import (
	crypto "crypto/rand"
	"encoding/base64"
	"fmt"
	"net/mail"
	"regexp"
	"strings"
)

// SanitizeString trims the string input
func SanitizeString(input string) string {
	return strings.TrimSpace(input)
}

/*
ValidateStrictPassword represents and checks for the following patterns:
- Input is at least 8 characters long and at most 16 characters long
- Input contains at least one special character of these @$!%*?_&#
- Input contains at least one digit
- Input contains at least one uppercase alphabet
- Input contains at least one lowercase alphabet
*/
func ValidateStrictPassword(input string) error {
	if len(input) < 8 {
		return fmt.Errorf("password length is less than 8 characters")
	}

	if len(input) > 16 {
		return fmt.Errorf("password length is more than 16 characters")
	}

	digits := `[0-9]{1}`
	lowerAlphabets := `[a-z]{1}`
	capitalAlphabets := `[A-Z]{1}`
	specialCharacters := `[@$!%*?_&#]{1}`
	if b, err := regexp.MatchString(digits, input); !b || err != nil {
		return fmt.Errorf("password does not contain digits")
	}
	if b, err := regexp.MatchString(lowerAlphabets, input); !b || err != nil {
		return fmt.Errorf("password does not contain lowercase alphabets")
	}
	if b, err := regexp.MatchString(capitalAlphabets, input); !b || err != nil {
		return fmt.Errorf("password does not contain uppercase alphabets")
	}
	if b, err := regexp.MatchString(specialCharacters, input); !b || err != nil {
		return fmt.Errorf("password does not contain special characters")
	}
	return nil
}

// RandomString generates random strings, can be used to create ids
func RandomString(n int) (string, error) {
	if n > 0 {
		b := make([]byte, n)
		_, err := crypto.Read(b)
		if err != nil {
			return "", err
		}

		return base64.URLEncoding.EncodeToString(b), nil
	}
	return "", fmt.Errorf("length should be greater than 0")
}

// ValidateStrictUsername validates usernames. Two formats are accepted:
// 1. Any valid email address
// 2. Plain usernames matching: ^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$
//    - Start/end with letter or digit
//    - Middle can contain letters, digits, underscores, or hyphens
//    - Length: 3-256 characters
func ValidateStrictUsername(username string) error {
	if len(username) < 3 {
		return fmt.Errorf("username must be at least 3 characters long")
	}
	if len(username) > 256 {
		return fmt.Errorf("username must be at most 256 characters long")
	}
	
 	if addr, err := mail.ParseAddress(username); err == nil && addr.Name == "" && addr.Address == username {
 		return nil
 	}

	plainUsernameRegex := regexp.MustCompile(`^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$`)
	if !plainUsernameRegex.MatchString(username) {
		return fmt.Errorf("username can only contain letters, numbers, underscores, and hyphens, must start and end with a letter or digit, and be 3–256 characters long")
	}
	return nil
}