package k8s

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/kubernetes/fake"
	core "k8s.io/client-go/testing"
)

func TestIsAgentConfirmed_ConfigMapNotFound(t *testing.T) {
	fakeClient := fake.NewSimpleClientset()
	confirmed, _, err := isAgentConfirmedWithClientset(fakeClient)
	assert.False(t, confirmed, "should not be confirmed when configmap missing")
	assert.Contains(t, err.Error(), "configmap not found")
}

func TestIsAgentConfirmed_NonNotFoundError(t *testing.T) {
	fakeClient := fake.NewSimpleClientset()
	fakeClient.PrependReactor("get", "configmaps", func(action core.Action) (bool, runtime.Object, error) {
		return true, nil, fmt.Errorf("connection refused")
	})
	confirmed, _, err := isAgentConfirmedWithClientset(fakeClient)
	assert.False(t, confirmed, "should not be confirmed on non-NotFound errors")
	assert.Contains(t, err.Error(), "connection refused")
}

func TestIsAgentConfirmed_SecretFetchError(t *testing.T) {
	fakeClient := fake.NewSimpleClientset()
	fakeClient.PrependReactor("get", "configmaps", func(action core.Action) (bool, runtime.Object, error) {
		return true, &corev1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{Name: InfraConfigName, Namespace: InfraNamespace},
			Data:       map[string]string{"IS_INFRA_CONFIRMED": "true"},
		}, nil
	})
	fakeClient.PrependReactor("get", "secrets", func(action core.Action) (bool, runtime.Object, error) {
		return true, nil, fmt.Errorf("forbidden")
	})
	confirmed, _, err := isAgentConfirmedWithClientset(fakeClient)
	assert.False(t, confirmed, "should not be confirmed when secret fetch fails")
	assert.Contains(t, err.Error(), "failed to get")
	assert.Contains(t, err.Error(), "forbidden")
}
