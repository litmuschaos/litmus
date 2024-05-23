package utils

import (
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
- Input is at least 8 characters long
- Input contains at least one special character
- Input contains at least one digit
- Input contains at least one uppercase alphabet
- Input contains at least one lowercase alphabet
*/
func ValidateStrictPassword(input string) error {
	if len(input) < 8 {
		return fmt.Errorf("password is less than 8 characters")
	}
	digits := `[0-9]{1}`
	lowerAlphabets := `[a-z]{1}`
	capitalAlphabets := `[A-Z]{1}`
	specialCharacters := `[!@#~$%^&*()+|_]{1}`
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

func ValidateStrictUsername(username string) error {
	if len(username) < 3 {
		return fmt.Errorf("username must be at least three characters long")
	}

	if len(username) > 12 {
		return fmt.Errorf("username must be at most twelve characters long")
	}

	// Ensure username doesn't contain special characters (only letters, numbers, and underscores are allowed)
	if matched, _ := regexp.MatchString(`^[a-zA-Z0-9_]+$`, username); !matched {
		return fmt.Errorf("username can only contain letters, numbers, and underscores")
	}

	return nil
}