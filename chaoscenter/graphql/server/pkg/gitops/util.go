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
func manifestFileName(name string) (string, error) {
	if name == "" || name == "." || name == ".." || strings.ContainsAny(name, `/\`) || filepath.Base(name) != name {
		return "", fmt.Errorf("invalid resource name %q", name)
	}
	return filepath.Base(name), nil
}
