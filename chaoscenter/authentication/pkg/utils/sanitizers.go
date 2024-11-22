package utils

import (
	crypto "crypto/rand"
	"encoding/base64"
	"fmt"
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

// Username must start with a letter - ^[a-zA-Z]
// Allow letters, digits, underscores, and hyphens - [a-zA-Z0-9_-]
// Ensure the length of the username is between 3 and 16 characters (1 character is already matched above) - {2,15}$

func ValidateStrictUsername(username string) error {
	// Ensure username doesn't contain special characters (only letters, numbers, and underscores are allowed)
	if matched, _ := regexp.MatchString(`^[a-zA-Z][a-zA-Z0-9_-]{2,15}$`, username); !matched {
		return fmt.Errorf("username can only contain letters, numbers, and underscores")
	}

	return nil
}
