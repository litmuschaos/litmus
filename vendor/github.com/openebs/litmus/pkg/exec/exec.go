/*
Copyright 2018 The OpenEBS Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package exec

import (
	"bytes"
	"fmt"
	osexec "os/exec"
	"strings"
)

// Executor acts as a contract for various execution based logic
type Executor interface {
	Output(args []string) (output string, err error)
}

// ShellExec is a shell based struct that implements Executor interface
type ShellExec struct {
	binary string
}

// NewShellExec returns a new instance of shellExec
// based on the provided binary name
func NewShellExec(binary string) *ShellExec {
	return &ShellExec{
		binary: binary,
	}
}

// Output executes the shell command and returns the output or error
func (e *ShellExec) Output(args []string) (output string, err error) {
	var out bytes.Buffer
	var stderr bytes.Buffer

	cmd := osexec.Command(e.binary, args...)
	cmd.Stdout = &out
	cmd.Stderr = &stderr

	err = cmd.Run()
	if err != nil {
		err = fmt.Errorf("failed to run cmd '%s': %s: %s", cmd.Args, fmt.Sprint(err), stderr.String())
		return
	}

	// This removes the beginning & trailing single quotes from the output
	// It has been observed that kubectl execution results in such single quotes
	output = strings.Trim(out.String(), "'")
	return
}
