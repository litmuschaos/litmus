package utils

import "testing"

func TestSanitizeMongoParam(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		want    string
		wantErr bool
	}{
		{
			name:  "allows benign values",
			input: "dev-team",
			want:  "dev-team",
		},
		{
			name:  "allows empty values",
			input: "",
			want:  "",
		},
		{
			name:    "rejects mongo operator prefix",
			input:   "$ne",
			wantErr: true,
		},
		{
			name:    "rejects embedded dollar sign",
			input:   "dev$team",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := SanitizeMongoParam(tt.input)
			if (err != nil) != tt.wantErr {
				t.Fatalf("SanitizeMongoParam() error = %v, wantErr %v", err, tt.wantErr)
			}
			if got != tt.want {
				t.Fatalf("SanitizeMongoParam() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestSanitizeMongoSlice(t *testing.T) {
	t.Run("allows benign slices", func(t *testing.T) {
		got, err := SanitizeMongoSlice([]string{"dev-team", "qa-team"})
		if err != nil {
			t.Fatalf("SanitizeMongoSlice() unexpected error = %v", err)
		}
		if len(got) != 2 || got[0] != "dev-team" || got[1] != "qa-team" {
			t.Fatalf("SanitizeMongoSlice() = %v, want [dev-team qa-team]", got)
		}
	})

	t.Run("rejects unsafe element", func(t *testing.T) {
		if _, err := SanitizeMongoSlice([]string{"dev-team", "qa$team"}); err == nil {
			t.Fatal("SanitizeMongoSlice() expected error for unsafe element")
		}
	})
}
