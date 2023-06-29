// Package k8s_test contains all the tests for the k8s package
package k8s_test

import (
	"io/ioutil"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/pkg/k8s"
	"github.com/litmuschaos/litmus/litmus-portal/graphql-server/utils"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"
	"k8s.io/client-go/rest"
)

var (
	tempPath = "/tmp/client/"
)

// TestMain is the entry point for testing
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	log.SetOutput(ioutil.Discard)
	os.Exit(m.Run())
}

// TestGetK8sClients tests the GetK8sClients function
func TestGetK8sClients(t *testing.T) {
	testcase := struct {
		name   string
		config *rest.Config
	}{
		name: "success",
		config: &rest.Config{
			Host: "https://localhost:8080",
		},
	}
	t.Run(testcase.name, func(t *testing.T) {
		// when
		_, _, _, err := k8s.GetK8sClients(testcase.config)
		// then
		assert.NoError(t, err)
	})
}

// TestGetKubeConfig tests the GetKubeConfig function
func TestGetKubeConfig(t *testing.T) {
	testcases := []struct {
		name    string
		wantErr bool
	}{
		{
			name:    "failure: invalid KubeConfig path",
			wantErr: true,
		},
		{
			name:    "success",
			wantErr: false,
		},
	}
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if tc.wantErr {
				// given
				utils.Config.KubeConfigFilePath = "invalid path"
				// when
				_, err := k8s.GetKubeConfig()
				// then
				assert.Error(t, err)
			} else {
				// given
				content := `
apiVersion: v1
clusters:
- cluster:
    server: https://localhost:8080
    extensions:
    - name: client.authentication.k8s.io/exec
      extension:
        audience: foo
        other: bar
  name: foo-cluster
contexts:
- context:
    cluster: foo-cluster
    user: foo-user
    namespace: bar
  name: foo-context
current-context: foo-context
kind: Config
users:
- name: foo-user
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1alpha1
      args:
      - arg-1
      - arg-2
      command: foo-command
      provideClusterInfo: true
`
				err := os.MkdirAll(tempPath, os.ModePerm)
				if err != nil {
					t.Error(err)
				}
				tmpFile, err := os.Create(tempPath + "kubeconfig")
				if err != nil {
					t.Error(err)
				}
				t.Cleanup(func() { _ = os.Remove(tempPath + "kubeconfig") })
				if err := os.WriteFile(tmpFile.Name(), []byte(content), 0666); err != nil {
					t.Error(err)
				}
				utils.Config.KubeConfigFilePath = tmpFile.Name()
				// when
				_, err = k8s.GetKubeConfig()
				// then
				assert.NoError(t, err)
			}
		})
	}
}
