package utils

import "strings"

func SanitizeString(input string) string {
	return strings.TrimSpace(input)
}
