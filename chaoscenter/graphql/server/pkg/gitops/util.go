package gitops

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// PathExists checks for the existence of this path
func PathExists(path string) (bool, error) {
	_, err := os.Stat(path)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

// manifestFileName validates that name can serve as a file name inside the
// project directory and returns it. Names come from API requests, so one that
// contains a path separator or refers to a parent directory must never reach
// the file system.
//
// filepath.IsLocal comes first because it is the only one of these checks that
// CodeQL's path-injection query recognises as a barrier; without it the query
// reports every file operation downstream. It is not sufficient on its own:
// IsLocal accepts ".", "dir/name" and "a/../b", so the element checks stay.
func manifestFileName(name string) (string, error) {
	if !filepath.IsLocal(name) {
		return "", fmt.Errorf("invalid resource name %q", name)
	}
	if name == "." || strings.ContainsAny(name, `/\`) || filepath.Base(name) != name {
		return "", fmt.Errorf("invalid resource name %q", name)
	}
	return name, nil
}
