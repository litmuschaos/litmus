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

package util

import (
	"os"
	"strings"
)

// ENVKey is a typed variable that holds all environment
// variables
type ENVKey string

const (
	// KubeNamespaceENVK is the ENV key to fetch the
	// namespace where LITMUS operations will be executed
	KubeNamespaceENVK ENVKey = "LITMUS_IO_KUBE_NAMESPACE"

	// KubeContextENVK is the ENV key to fetch the
	// kubernetes context where LITMUS operations will be executed
	KubeContextENVK ENVKey = "LITMUS_IO_KUBE_CONTEXT"

	// KubeConfigENVK is the ENV key to fetch the kubeconfig file path
	// This kubeconfig will be used to connect to target kubernetes cluster
	KubeConfigENVK ENVKey = "LITMUS_IO_KUBE_CONFIG"

	// KubectlPathENVK is the ENV key to fetch kubectl executable location
	KubectlPathENVK ENVKey = "LITMUS_IO_KUBECTL_PATH"
)

// KubectlPathENV gets the kubectl executable location from ENV
func KubectlPathENV() string {
	val := getEnv(KubectlPathENVK)
	return val
}

// KubeNamespaceENV gets the kubernetes namespace from ENV
func KubeNamespaceENV() string {
	val := getEnv(KubeNamespaceENVK)
	return val
}

// KubeContextENV gets the kubernetes context from ENV
func KubeContextENV() string {
	val := getEnv(KubeContextENVK)
	return val
}

// KubeConfigENV gets the kubeconfig file path from ENV
func KubeConfigENV() string {
	val := getEnv(KubeConfigENVK)
	return val
}

// getEnv fetches the environment variable value from the machine's
// environment
func getEnv(envKey ENVKey) string {
	return strings.TrimSpace(os.Getenv(string(envKey)))
}
