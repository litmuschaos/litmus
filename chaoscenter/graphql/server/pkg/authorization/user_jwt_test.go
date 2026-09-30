package authorization

import (
	"context"
	"testing"
)

func TestGetUsernameFromContext(t *testing.T) {
	tests := []struct {
		name    string
		ctx     context.Context
		want    string
		wantErr bool
	}{
		{
			name:    "returns an error for a nil context",
			ctx:     nil,
			wantErr: true,
		},
		{
			name:    "returns an error when no actor is present",
			ctx:     context.Background(),
			wantErr: true,
		},
		{
			name: "uses the trusted system actor",
			ctx: context.WithValue(
				context.Background(),
				SystemActorKey,
				"git-ops",
			),
			want: "git-ops",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got, err := GetUsernameFromContext(test.ctx)
			if (err != nil) != test.wantErr {
				t.Fatalf("GetUsernameFromContext() error = %v, wantErr %v", err, test.wantErr)
			}
			if got != test.want {
				t.Errorf("GetUsernameFromContext() = %q, want %q", got, test.want)
			}
		})
	}
}
