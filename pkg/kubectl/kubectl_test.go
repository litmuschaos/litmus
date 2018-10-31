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
	"os"
	"reflect"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/pkg/errors"

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
				t.Fatalf("test '%s' failed: expected value: %s, actual value: %s", name, mock.expected, path)
			}

			if path != KubectlPath {
				os.Unsetenv(kubectlPathENVK)
			}

		})

	}

}

func TestKubectl_Namespace(t *testing.T) {

	const someNS = "someNS"

	tests := map[string]struct {
		namespace string
		expected  string
	}{
		"test 101": {expected: "litmus"},
		"test 102": {namespace: someNS, expected: someNS},
	}

	for name, mock := range tests {

		t.Run(name, func(t *testing.T) {

			kubeCtl := New()

			if mock.expected != kubeCtl.Namespace(mock.namespace).namespace {
				t.Fatalf("test '%s' failed: expected value: %s, actual value %s", "101", mock.expected, kubeCtl.namespace)
			}

		})

	}

}

func TestKubectl_Labels(t *testing.T) {

	labels := "someLabel"

	kubeCtl := New()

	if labels != kubeCtl.Labels(labels).labels {
		t.Fatalf("test '%s' failed: expected value: %s, actual value %s", "101", labels, kubeCtl.labels)
	}

}

func TestKubectl_Context(t *testing.T) {

	ctx := "someCtx"

	kubeCtl := New()

	if ctx != kubeCtl.Context(ctx).context {
		t.Fatalf("test '%s' failed: expected value: %s, actual value %s", "101", ctx, kubeCtl.context)
	}

}

func TestKubectl_Args(t *testing.T) {

	args := []string{"something"}

	kubeCtl := New()

	if !reflect.DeepEqual(args, kubeCtl.Args(args).args) {
		t.Fatalf("test '%s' failed: expected value: %s, actual value %s", "101", args, kubeCtl.args)
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
			},
		},
		"test 201": {
			args: []string{context, labels},
			expected: &expected{
				output: "--namespace=litmus--context=someCtx--selector=someLabels",
				err:    errors.New("some output error"),
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
				t.Fatalf("test '%s' failed: expected error: %s, actual error: %s", name, mock.expected.err, err)
			}

			if output != mock.expected.output {
				t.Fatalf("test '%s' failed: expected value: %s, actual value %s", name, mock.expected.output, output)
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
		"test 201": {},
	}

	for name, mock := range tests {
		t.Run(name, func(t *testing.T) {

			isPod := IsPod(mock.pod)

			if mock.expected != isPod {
				t.Fatalf("test '%s' failed: expected value: %t, actual value: %t", name, mock.expected, isPod)
			}

		})

	}

}

func TestArePodsRunning(t *testing.T) {

	args := []string{"get", "pods", "-o", "jsonpath='{.items[*].status.containerStatuses[*].ready}'"}

	type expected struct {
		runningBool   bool
		runningString string
		runErr        error
		err           error
	}

	tests := map[string]struct {
		expected *expected
	}{
		"test 101": {
			expected: &expected{
				runningString: "true",
				runningBool:   true,
			},
		},
		"test 201": {
			expected: &expected{
				runErr:        errors.New("some running err"),
				runningString: "false",
			},
		},
		"test 202": {
			expected: &expected{
				err:           fmt.Errorf("pod(s) are not running: '%#v'", []string{"true", "false"}),
				runningString: "true false",
			},
		},
		"test 203": {
			expected: &expected{err: fmt.Errorf("status of pod(s) could not be determined: '%#v'", []string{""})},
		},
	}

	for name, mock := range tests {
		t.Run(name, func(t *testing.T) {

			ctrl := gomock.NewController(t)

			defer ctrl.Finish()

			mockRunner := NewMockKubeRunner(ctrl)

			mockRunner.EXPECT().Run(args).Return(mock.expected.runningString, mock.expected.runErr).AnyTimes()

			running, err := ArePodsRunning(mockRunner)

			if mock.expected.runErr != nil && err != mock.expected.runErr {
				t.Fatalf("test '%s' failed: expected error: %s, actual error: %s", name, mock.expected.runErr, err)
			} else if mock.expected.err != nil && err.Error() != mock.expected.err.Error() {
				t.Fatalf("test '%s' failed: expected error: %s, actual error: %s", name, mock.expected.err, err)
			}

			if running != mock.expected.runningBool {
				t.Fatalf("test '%s' failed: expected value: %t, actual value: %t", name, mock.expected.runningBool, running)
			}

		})

	}

}

func TestIsPodRunning(t *testing.T) {

	const someName = "someName"

	args := []string{"get", "pods", "", "-o", "jsonpath='{.status.containerStatuses[*].ready}'"}

	type expected struct {
		runningBool   bool
		runningString string
		runErr        error
		err           error
	}

	tests := map[string]struct {
		name     string
		expected *expected
	}{
		"test 101": {
			name: someName,
			expected: &expected{
				runningBool:   true,
				runningString: "true",
			},
		},
		"test 201": {
			name: "",
			expected: &expected{
				runningString: "false",
				err:           errors.New("unable to determine pod running status: pod name is missing"),
			},
		},
		"test 202": {
			name: someName,
			expected: &expected{
				runningString: "false",
				runErr:        errors.New("some running err"),
			},
		},
		"test 203": {
			name: someName,
			expected: &expected{
				runningString: "false",
				err:           fmt.Errorf("pod '%s' is not running: '%#v'", someName, []string{"false"}),
			},
		},
		"test 204": {
			name:     someName,
			expected: &expected{err: fmt.Errorf("status of pod '%s' could not be determined: received output '%#v'", someName, []string{""})},
		},
	}

	for name, mock := range tests {
		t.Run(name, func(t *testing.T) {

			args[2] = mock.name

			ctrl := gomock.NewController(t)

			defer ctrl.Finish()

			mockRunner := NewMockKubeRunner(ctrl)

			mockRunner.EXPECT().Run(args).Return(mock.expected.runningString, mock.expected.runErr).AnyTimes()

			isRunning, err := IsPodRunning(mockRunner, mock.name)

			if mock.expected.runErr != nil && err != mock.expected.runErr {
				t.Fatalf("test '%s' failed: expected error: %s, actual error: %s", name, mock.expected.runErr, err)
			} else if mock.expected.err != nil && err.Error() != mock.expected.err.Error() {
				t.Fatalf("test '%s' failed: expected error: %s, actual error: %s", name, mock.expected.err, err)
			}

			if isRunning != mock.expected.runningBool {
				t.Fatalf("test '%s' failed: expected value %t, actual value %t", name, mock.expected.runningBool, isRunning)
			}

		})

	}

}

func TestGetPodNodes(t *testing.T) {

	args := []string{"get", "pods", "-o", "jsonpath='{.items[*].spec.nodeName}'"}

	type expected struct {
		err   error
		nodes []string
	}

	tests := map[string]struct {
		input    string
		expected *expected
	}{
		"test 101": {
			input:    "some stuff",
			expected: &expected{nodes: []string{"some", "stuff"}},
		},
		"test 201": {
			expected: &expected{err: errors.New("some running err")},
		},
	}

	for name, mock := range tests {
		t.Run(name, func(t *testing.T) {

			ctrl := gomock.NewController(t)

			defer ctrl.Finish()

			mockRunner := NewMockKubeRunner(ctrl)

			mockRunner.EXPECT().Run(args).Return(mock.input, mock.expected.err).AnyTimes()

			nodes, err := GetPodNodes(mockRunner)

			if err != mock.expected.err {
				t.Fatalf("test '%s' failed: expected error: %s, actual error: %s", name, mock.expected.err, err)
			}

			if !reflect.DeepEqual(nodes, mock.expected.nodes) {
				t.Fatalf("test '%s' failed: expected value %v, actual value %v", name, mock.expected.nodes, nodes)
			}

		})
	}

}

func TestGetPods(t *testing.T) {

	args := []string{"get", "pods", "-o", "jsonpath='{.items[*].metadata.name}'"}

	type expected struct {
		err   error
		nodes []string
	}

	tests := map[string]struct {
		input    string
		expected *expected
	}{
		"test 101": {
			input:    "some stuff",
			expected: &expected{nodes: []string{"some", "stuff"}},
		},
		"test 201": {
			expected: &expected{err: errors.New("some running err")},
		},
	}

	for name, mock := range tests {
		t.Run(name, func(t *testing.T) {

			ctrl := gomock.NewController(t)

			defer ctrl.Finish()

			mockRunner := NewMockKubeRunner(ctrl)

			mockRunner.EXPECT().Run(args).Return(mock.input, mock.expected.err).AnyTimes()

			nodes, err := GetPods(mockRunner)

			if err != mock.expected.err {
				t.Fatalf("test '%s' failed: expected error: %s, actual error: %s", name, mock.expected.err, err)
			}

			if !reflect.DeepEqual(nodes, mock.expected.nodes) {
				t.Fatalf("test '%s' failed: expected value %v, actual value %v", name, mock.expected.nodes, nodes)
			}
		})
	}

}

func TestGetRunningPods(t *testing.T) {

	args := []string{"get", "pods", "-o", "jsonpath='{range .items[*]}{@.metadata.name}::{@.status.containerStatuses[*].ready}::::{end}'"}

	tests := map[string]struct {
		err    error
		output []string
		input  string
	}{
		"test 101": {},
		"test 102": {input: "true::false::::true::false"},
		"test 103": {input: "false::true::::true::true", output: []string{"false", "true"}},
		"test 201": {err: errors.New("some running err")},
	}

	for name, mock := range tests {

		t.Run(name, func(t *testing.T) {

			ctrl := gomock.NewController(t)

			defer ctrl.Finish()

			mockRunner := NewMockKubeRunner(ctrl)

			mockRunner.EXPECT().Run(args).Return(mock.input, mock.err).AnyTimes()

			output, err := GetRunningPods(mockRunner)

			if err != mock.err {
				t.Fatalf("test '%s' failed: expected error: %s, actual error: %s", name, mock.err, err)
			}

			if !reflect.DeepEqual(output, mock.output) {
				t.Fatalf("test '%s' failed: expected value %v, actual value %v", name, mock.output, output)
			}

		})
	}

}

func TestGetOldestRunningPod(t *testing.T) {

	args := []string{"get", "pods", "-o", "--sort-by=.metadata.creationTimestamp", "jsonpath='{range .items[*]}{@.metadata.name}::{@.status.containerStatuses[*].ready}::::{end}'"}

	tests := map[string]struct {
		err    error
		output string
		input  string
	}{
		"test 101": {},
		"test 102": {input: "true::false::::true::false"},
		"test 103": {input: "true::true::::true::false", output: "true"},
		"test 201": {err: errors.New("some running err")},
	}

	for name, mock := range tests {

		t.Run(name, func(t *testing.T) {

			ctrl := gomock.NewController(t)

			defer ctrl.Finish()

			mockRunner := NewMockKubeRunner(ctrl)

			mockRunner.EXPECT().Run(args).Return(mock.input, mock.err).AnyTimes()

			output, err := GetOldestRunningPod(mockRunner)

			if err != mock.err {
				t.Fatalf("test '%s' failed: expected error: %s, actual error: %s", name, mock.err, err)
			}

			if output != mock.output {
				t.Fatalf("test '%s' failed: expected value %v, actual value %v", name, mock.output, output)
			}

		})
	}

}

func TestDeletePod(t *testing.T) {

	args := []string{"delete", "pods", "someName"}
	const somename = "someName"

	tests := map[string]struct {
		err error
	}{
		"test 101": {},
		"test 102": {err: errors.New("some runnign err")},
	}

	for name, mock := range tests {

		ctrl := gomock.NewController(t)

		defer ctrl.Finish()

		mockRunner := NewMockKubeRunner(ctrl)

		mockRunner.EXPECT().Run(args).Return("", mock.err).AnyTimes()

		if err := DeletePod(mockRunner, somename); err != mock.err {
			t.Fatalf("test '%s' failed: expected error: %s, actual error: %s", name, mock.err, err)
		}

	}

}
