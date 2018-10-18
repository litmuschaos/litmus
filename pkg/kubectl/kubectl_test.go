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
package kubectl

import (
	"fmt"
	"io"
	"os"
	"strings"
	"testing"

	"github.com/golang/mock/gomock"

	"github.com/openebs/litmus/pkg/exec"
)

func TestGetKubectlPath(t *testing.T) {

	const kubectlPathENVK = "LITMUS_IO_KUBECTL_PATH"

	tests := map[string]struct {
		fn       func()
		expected string
	}{
		"test 101": {fn: func() {}, expected: KubectlPath},
		"test 102": {fn: func() { os.Setenv(kubectlPathENVK, "someVal") }, expected: "someVal"},
	}

	for name, mock := range tests {

		t.Run(name, func(t *testing.T) {

			mock.fn()

			path := GetKubectlPath()

			if path != mock.expected {
				t.Fatalf("Test '%s' failed: expected value: %s actual value: %s", name, mock.expected, path)
			}

			if path != KubectlPath {
				os.Unsetenv(kubectlPathENVK)
			}

		})

	}

}

func TestKubectl_Run(t *testing.T) {

	const (
		namespace = "--namespace=litmus"
		context   = "someCtx"
		labels    = "someLabels"
	)

	type expected struct {
		output string
		err    error
	}

	tests := map[string]struct {
		args     []string
		expected *expected
	}{
		"test 101": {
			args: []string{context, labels, namespace},
			expected: &expected{
				output: "--namespace=litmus--context=someCtx--selector=someLabels",
				err:    nil,
			},
		},
		"test 201": {
			args: []string{context, labels},
			expected: &expected{
				output: "--namespace=litmus--context=someCtx--selector=someLabels",
				err:    io.ErrClosedPipe,
			},
		},
	}

	for name, mock := range tests {

		t.Run(name, func(t *testing.T) {

			ctrl := gomock.NewController(t)

			defer ctrl.Finish()

			mockExecutor := exec.NewMockExecutor(ctrl)
			mockExecutor.EXPECT().Output(mock.args).Return(mock.expected.output, mock.expected.err)

			ctl := New()
			ctl.executor = mockExecutor

			output, err := ctl.Run(mock.args[:len(mock.args)-1])

			if err != mock.expected.err {
				t.Fatalf("Unexpected error: %s", err)
			}

			if output != mock.expected.output {
				t.Fatalf("Unexpected output: %s", output)
			}

		})

	}

}

func TestIsPod(t *testing.T) {

	tests := map[string]struct {
		pod      string
		expected bool
	}{
		"test 101": {pod: "po", expected: true},
		"test 102": {pod: "pod", expected: true},
		"test 103": {pod: "pods", expected: true},
		"test 104": {pod: "deploy", expected: true},
		"test 105": {pod: "deployment", expected: true},
		"test 106": {pod: "deployments", expected: true},
		"test 107": {pod: "job", expected: true},
		"test 108": {pod: "jobs", expected: true},
		"test 109": {pod: "sts", expected: true},
		"test 110": {pod: "statefulset", expected: true},
		"test 111": {pod: "statefulsets", expected: true},
		"test 112": {pod: "ds", expected: true},
		"test 113": {pod: "daemonset", expected: true},
		"test 114": {pod: "daemonsets", expected: true},
		"test 201": {pod: "", expected: false},
	}

	for name, mock := range tests {

		t.Run(name, func(t *testing.T) {

			isPod := IsPod(mock.pod)

			if mock.expected != isPod {
				t.Fatalf("Test '%s' failed: expected value: %t actual value: %t", name, mock.expected, isPod)
			}

		})

	}

}

func TestArePodsRunning(t *testing.T) {

	args := []string{"get", "pods", "-o", "jsonpath='{.items[*].status.containerStatuses[*].ready}'"}

	type expected struct {
		runningBool   bool
		runningString string
		err           error
	}

	tests := map[string]struct {
		args     []string
		expected *expected
	}{
		"test 101": {
			args: args,
			expected: &expected{
				err:           nil,
				runningString: "true",
				runningBool:   true,
			},
		},
		"test 201": {
			args: args,
			expected: &expected{
				err:           io.ErrClosedPipe,
				runningString: "false",
				runningBool:   false,
			},
		},
		"test 202": {
			args: args,
			expected: &expected{
				err:           nil,
				runningString: "true false",
				runningBool:   false,
			},
		},
		"test 203": {
			args: args,
			expected: &expected{
				err:           nil,
				runningString: "weirdo",
				runningBool:   false,
			},
		},
	}

	for name, mock := range tests {

		t.Run(name, func(t *testing.T) {

			ctrl := gomock.NewController(t)

			defer ctrl.Finish()

			mockRunner := NewMockKubeRunner(ctrl)

			mockRunner.EXPECT().Run(mock.args).Return(mock.expected.runningString, mock.expected.err)

			running, err := ArePodsRunning(mockRunner)

			if err != nil {

				if err != io.ErrClosedPipe {

					notRunningErr := fmt.Errorf("pod(s) are not running: '%#v' '%#v'", mockRunner, strings.Split(mock.expected.runningString, " "))
					unknownStatusErr := fmt.Errorf("status of pod(s) could not be determined: '%#v' '%#v'", mockRunner, []string{"weirdo"})

					if err.Error() != notRunningErr.Error() && err.Error() != unknownStatusErr.Error() {
						t.Fatalf("Unexpected error, expecting %s, found %s", mock.expected.err, err)
					}

				} else {

					if err != mock.expected.err {
						t.Fatalf("Unexpected error, expecting %s, found %s", mock.expected.err, err)
					}

				}

			}

			if running != mock.expected.runningBool {
				t.Fatalf("Unexpected running status, expected: %t, got: %t", mock.expected.runningBool, running)
			}

		})

	}

}

func TestIsPodRunning(t *testing.T) {
	// TODO
}

func TestGetPodNodes(t *testing.T) {
	// TODO
}

func TestGetPods(t *testing.T) {
	// TODO
}

func TestGetRunningPods(t *testing.T) {
	// TODO
}

func TestGetOldestRunningPod(t *testing.T) {
	// TODO
}

func TestDeletePod(t *testing.T) {
	// TODO
}
