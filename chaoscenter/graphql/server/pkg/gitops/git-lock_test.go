package gitops

import "testing"

func TestGetKey(t *testing.T) {
	branch := "main"
	tests := []struct {
		name   string
		repo   string
		branch *string
		want   string
	}{
		{name: "no branch returns the repo", repo: "https://github.com/litmuschaos/litmus.git", branch: nil, want: "https://github.com/litmuschaos/litmus.git"},
		{name: "https url", repo: "https://github.com/litmuschaos/litmus.git", branch: &branch, want: "litmuschaos/litmus/main"},
		{name: "https url without suffix", repo: "https://github.com/litmuschaos/litmus", branch: &branch, want: "litmuschaos/litmus/main"},
		{name: "repo name ending with a letter from the suffix", repo: "https://github.com/org/testing.git", branch: &branch, want: "org/testing/main"},
		{name: "repo name ending with git", repo: "https://github.com/org/chaos-git.git", branch: &branch, want: "org/chaos-git/main"},
		{name: "ssh url", repo: "git@github.com:org/config.git", branch: &branch, want: "org/config/main"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getKey(tt.repo, tt.branch); got != tt.want {
				t.Errorf("getKey(%q) = %q, want %q", tt.repo, got, tt.want)
			}
		})
	}
}
