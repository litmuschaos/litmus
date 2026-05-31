package graphql

import (
	"math"
	"strconv"
	"strings"
	"testing"
)

func FuzzMarshalGQLData(f *testing.F) {
	for _, seed := range []string{
		"",
		"plain-text",
		`{"workflowID":"abc","status":"Running"}`,
		`quotes: "value"`,
		`backslash: \`,
		"line one\nline two",
		"tab\tseparated\tvalue",
		"carriage\rreturn",
		"null-byte:\x00",
		"control-bytes:\x01\x02\x03",
		"delete-control:\x7f",
		"unicode-escape:\u2603",
		"supplementary-plane:\U0001F680",
		"invalid-utf8:\xff\xfe\xfd",
		strings.Repeat("a", 1024),
	} {
		f.Add(seed)
	}

	f.Fuzz(func(t *testing.T, input string) {
		payload := map[string]interface{}{
			"eventID": "fuzz-event",
			"message": input,
			"metadata": map[string]interface{}{
				"raw":        input,
				"length":     len(input),
				"hasQuote":   strings.Contains(input, `"`),
				"hasSlash":   strings.Contains(input, `\`),
				"hasNewline": strings.Contains(input, "\n"),
			},
			"items": []string{input},
		}

		got, err := NewSubscriberGql().MarshalGQLData(payload)
		if err != nil {
			t.Fatalf("MarshalGQLData returned unexpected error for JSON-marshalable input: %v", err)
		}

		assertValidQuotedPayload(t, got)
	})
}

func TestMarshalGQLDataReturnsMarshalError(t *testing.T) {
	tests := []struct {
		name string
		in   interface{}
	}{
		{
			name: "function value",
			in:   func() {},
		},
		{
			name: "positive infinity",
			in:   math.Inf(1),
		},
		{
			name: "not a number",
			in:   math.NaN(),
		},
	}

	gql := NewSubscriberGql()
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := gql.MarshalGQLData(tt.in)
			if err == nil {
				t.Fatalf("expected json marshal error, got nil")
			}
			if got != "" {
				t.Fatalf("expected empty output on marshal error, got %q", got)
			}
		})
	}
}

func assertValidQuotedPayload(t *testing.T, got string) {
	t.Helper()

	if got == "" {
		t.Fatal("MarshalGQLData returned an empty string")
	}

	if len(got) < 2 || got[0] != '"' || got[len(got)-1] != '"' {
		t.Fatalf("MarshalGQLData output is not wrapped as a quoted literal: %q", got)
	}

	if strings.ContainsAny(got, "\n\r") {
		t.Fatalf("MarshalGQLData output contains raw line terminator characters: %q", got)
	}

	if _, err := strconv.Unquote(got); err != nil {
		t.Fatalf("MarshalGQLData output is not a valid quoted payload: output=%q err=%v", got, err)
	}
}
