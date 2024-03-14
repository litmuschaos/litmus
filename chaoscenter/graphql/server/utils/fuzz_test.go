package utils

import (
	"strings"
	"testing"

	fuzz "github.com/AdaLogics/go-fuzz-headers"
)

func isValidString(s string) bool {
	// Define the set of valid characters
	validChars := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-"

	// Iterate over each character in the string
	for _, char := range s {
		// Check if the character is not in the set of valid characters
		if !strings.ContainsRune(validChars, char) {
			return false
		}
	}
	return true
}

func FuzzRandomString(f *testing.F) {
	f.Add(10)
	f.Fuzz(func(t *testing.T, n int) {
		randomString := RandomString(n)
		// Perform checks on the generated string
		// Check if the length matches the expected length
		if n >= 0 && len(randomString) != n {
			t.Errorf("Generated string length doesn't match expected length")
		}

		// Check if the string contains only valid characters
		if !isValidString(randomString) {
			t.Errorf("Generated string contains invalid characters")
		}
	})

}

func FuzzContainsString(f *testing.F) {
	f.Fuzz(func(t *testing.T, data []byte) {
		fuzzConsumer := fuzz.NewConsumer(data)
		targetStruct := &struct {
			s   []string
			str string
		}{}
		err := fuzzConsumer.GenerateStruct(targetStruct)
		if err != nil {
			return
		}
		// Perform checks on the ContainsString function
		// Check if ContainsString returns true when the target string is in the array
		if ContainsString(targetStruct.s, targetStruct.str) {
			found := false
			for _, v := range targetStruct.s {
				if v == targetStruct.str {
					found = true
					break
				}
			}
			if !found {
				t.Errorf("ContainsString returned true for target '%s' not present in the array", targetStruct.str)
			}
		} else {
			// Check if ContainsString returns false when the target string is not in the array
			found := false
			for _, v := range targetStruct.s {
				if v == targetStruct.str {
					found = true
					break
				}
			}
			if found {
				t.Errorf("ContainsString returned false for target '%s' present in the array", targetStruct.str)
			}
		}
	})
}
