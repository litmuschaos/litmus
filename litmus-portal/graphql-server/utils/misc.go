package utils

import (
	"bytes"
	"encoding/base64"
	"github.com/gin-gonic/gin"
	"math/rand"
	"strings"
	"unicode"
)

// WriteHeaders adds important headers to API responses
func WriteHeaders(w *gin.ResponseWriter, statusCode int) {
	(*w).Header().Set("Content-Type", "application/json; charset=utf-8")
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).WriteHeader(statusCode)
}

// RandomString generates random strings, can be used to create ids or random secrets
func RandomString(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-")
	s := make([]rune, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
}

// URLDecodeBase64 decader String of type base64 or return the text if error happens
func URLDecodeBase64(enconded string) string {
	decoded, err := base64.RawURLEncoding.DecodeString(enconded)
	if err != nil {
		return enconded
	}
	return string(decoded)
}

func AddRootIndent(b []byte, n int) []byte {
	prefix := append([]byte("\n"), bytes.Repeat([]byte(" "), n)...)
	return bytes.ReplaceAll(b, []byte("\n"), prefix)
}

// ContainsString checks if a string is present in an array of strings
func ContainsString(s []string, str string) bool {
	for _, v := range s {
		if v == str {
			return true
		}
	}

	return false
}

// Truncate a float to two levels of precision
func Truncate(num float64) float64 {
	return float64(int(num*100)) / 100
}

// Split returns the string in between a before sub-string and an after sub-string
func Split(str, before, after string) string {
	a := strings.SplitAfterN(str, before, 2)
	b := strings.SplitAfterN(a[len(a)-1], after, 2)
	if 1 == len(b) {
		return b[0]
	}
	return b[0][0 : len(b[0])-len(after)]
}

// GetKeyValueMapFromQuotedString returns key value pairs from a string with quotes
func GetKeyValueMapFromQuotedString(quotedString string) map[string]string {
	lastQuote := rune(0)
	f := func(c rune) bool {
		switch {
		case c == lastQuote:
			lastQuote = rune(0)
			return false
		case lastQuote != rune(0):
			return false
		case unicode.In(c, unicode.Quotation_Mark):
			lastQuote = c
			return false
		default:
			return unicode.IsSpace(c)

		}
	}

	// splitting string by space but considering quoted section
	items := strings.FieldsFunc(quotedString, f)

	// create and fill the map
	m := make(map[string]string)
	for _, item := range items {
		x := strings.Split(item, "=")
		m[x[0]] = x[1][1 : len(x[1])-2]
	}

	return m
}
