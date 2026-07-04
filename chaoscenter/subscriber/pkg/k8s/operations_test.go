package k8s

import (
	"context"
	"reflect"
	"testing"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	dynamicfake "k8s.io/client-go/dynamic/fake"
	kubefake "k8s.io/client-go/kubernetes/fake"
)

func TestAddCustomLabels(t *testing.T) {
	// 1. ARRANGE
	obj := &unstructured.Unstructured{}
	obj.SetLabels(map[string]string{"existing": "label"})
	labelsToAdd := map[string]string{
		"new_label": "value1",
		"owner":     "test",
	}
	expected := map[string]string{
		"existing":  "label",
		"new_label": "value1",
		"owner":     "test",
	}

	// 2. ACT
	addCustomLabels(obj, labelsToAdd)

	// 3. ASSERT
	result := obj.GetLabels()
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Test failed: expected labels %v, but got %v", expected, result)
	}
}

func TestAddCustomLabels_unsetObjectLabels(t *testing.T) {
	obj := &unstructured.Unstructured{}

	addCustomLabels(obj, map[string]string{"updated_by": "user"})

	expected := map[string]string{"updated_by": "user"}
	if !reflect.DeepEqual(obj.GetLabels(), expected) {
		t.Fatalf("expected labels %v, got %v", expected, obj.GetLabels())
	}
}

func TestAddCustomLabels_nilCustomLabels(t *testing.T) {
	obj := &unstructured.Unstructured{}
	obj.SetLabels(map[string]string{"existing": "label"})

	addCustomLabels(obj, nil)

	expected := map[string]string{"existing": "label"}
	if !reflect.DeepEqual(obj.GetLabels(), expected) {
		t.Fatalf("expected labels unchanged as %v, got %v", expected, obj.GetLabels())
	}
}

func TestAddCustomLabels_overwriteExisting(t *testing.T) {
	obj := &unstructured.Unstructured{}
	obj.SetLabels(map[string]string{"key": "old"})

	addCustomLabels(obj, map[string]string{"key": "new"})

	expected := map[string]string{"key": "new"}
	if !reflect.DeepEqual(obj.GetLabels(), expected) {
		t.Fatalf("expected labels %v, got %v", expected, obj.GetLabels())
	}
}

func TestApplyRequest(t *testing.T) {
	// 1. ARRANGE: Create a fake pod object to "get"
	fakePod := &corev1.Pod{
		TypeMeta: metav1.TypeMeta{
			Kind:       "Pod",
			APIVersion: "v1",
		},
		ObjectMeta: metav1.ObjectMeta{
			Name:      "my-fake-pod",
			Namespace: "litmus",
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{Name: "test-container", Image: "test-image"},
			},
		},
	}

	// Convert the typed Pod into an Unstructured object for the test
	unstructuredPod, err := runtime.DefaultUnstructuredConverter.ToUnstructured(fakePod)
	if err != nil {
		t.Fatalf("Failed to convert fake pod: %v", err)
	}
	objToGet := &unstructured.Unstructured{Object: unstructuredPod}

	// Create the fake dynamic client and pre-load it with our fake pod
	// We also need to register the "Pod" type with the client's scheme
	s := runtime.NewScheme()
	s.AddKnownTypes(corev1.SchemeGroupVersion, &corev1.Pod{})

	fakeDynamicClient := dynamicfake.NewSimpleDynamicClient(s, objToGet)

	// The 'dr' (dynamic resource) variable needs to be set, just like in the real code
	// We tell it to look for "pods" in the "litmus" namespace
	dr = fakeDynamicClient.Resource(corev1.SchemeGroupVersion.WithResource("pods")).Namespace("litmus")

	// 2. ACT: Call the 'get' operation
	response, err := applyRequest("get", objToGet)

	// 3. ASSERT: Check that we got our fake pod back
	if err != nil {
		t.Fatalf("applyRequest 'get' failed: %v", err)
	}
	if response == nil {
		t.Fatal("applyRequest 'get' returned nil response")
	}
	if response.GetName() != "my-fake-pod" {
		t.Errorf("Expected pod 'my-fake-pod', but got '%s'", response.GetName())
	}
}

func TestApplyRequest_Create(t *testing.T) {
	// 1. ARRANGE: Create an object to be created
	objToCreate := &unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": "v1",
			"kind":       "ConfigMap",
			"metadata": map[string]interface{}{
				"name":      "new-cm",
				"namespace": "litmus",
			},
			"data": map[string]interface{}{
				"key": "value",
			},
		},
	}

	// Create an EMPTY fake dynamic client (it has no objects yet)
	s := runtime.NewScheme()
	s.AddKnownTypes(corev1.SchemeGroupVersion, &corev1.ConfigMap{})
	fakeDynamicClient := dynamicfake.NewSimpleDynamicClient(s)

	// Set the global 'dr' variable for the test
	dr = fakeDynamicClient.Resource(corev1.SchemeGroupVersion.WithResource("configmaps")).Namespace("litmus")

	// 2. ACT: Call the 'create' operation
	response, err := applyRequest("create", objToCreate)
	if err != nil {
		t.Fatalf("applyRequest 'create' failed: %v", err)
	}

	// 3. ASSERT: Check that the object was created
	if response.GetName() != "new-cm" {
		t.Errorf("Expected created object 'new-cm', but got '%s'", response.GetName())
	}

	// Also, try to "get" the object from the fake client to prove it's there
	_, err = dr.Get(context.TODO(), "new-cm", metav1.GetOptions{})
	if err != nil {
		t.Errorf("Failed to 'get' the newly created object from the fake client: %v", err)
	}
}

func readyPod(name, namespace string, labels map[string]string) *corev1.Pod {
	return &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
			Labels:    labels,
		},
		Status: corev1.PodStatus{
			Phase: corev1.PodRunning,
			ContainerStatuses: []corev1.ContainerStatus{
				{
					Ready: true,
				},
			},
		},
	}
}

func notRunningPod(name, namespace string, labels map[string]string) *corev1.Pod {

	return &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
			Labels:    labels,
		},
		Status: corev1.PodStatus{
			Phase: corev1.PodPending,
			ContainerStatuses: []corev1.ContainerStatus{
				{
					Ready: false,
				},
			},
		},
	}
}
func TestDeploymentHealthy(t *testing.T) {
	t.Parallel()

	const defaultNamespace = "litmus"

	testCases := []struct {
		name     string
		pods     []runtime.Object
		selector string
		healthy  bool
	}{
		{
			name: "Ready pod matches selector",
			pods: []runtime.Object{
				readyPod("exp-1", defaultNamespace, map[string]string{"app": "chaos-exporter"}),
			},
			selector: "app=chaos-exporter",
			healthy:  true,
		},
		{
			name:     "No pod found",
			pods:     []runtime.Object{},
			selector: "app=chaos-exporter",
			healthy:  false,
		},
		{
			name: "Selector doesn't match any pod",
			pods: []runtime.Object{
				readyPod("exp-1", defaultNamespace, map[string]string{"app": "chaos-exporter"}),
			},
			selector: "app=chaos-operator",
			healthy:  false,
		},
		{
			name: "Pod not running",
			pods: []runtime.Object{
				notRunningPod("exp-1", defaultNamespace, map[string]string{"app": "chaos-exporter"}),
			},
			selector: "app=chaos-exporter",
			healthy:  false,
		},
	}

	// Run test cases
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := kubefake.NewSimpleClientset(tc.pods...)
			got := deploymentHealthy(context.Background(), client, defaultNamespace, tc.selector)

			if got != tc.healthy {
				t.Errorf("deploymentHealthy(%q, %q) = %v, want %v", tc.selector, tc.name, got, tc.healthy)
			}
		})
	}
}

func TestAllDeploymentsHealthy(t *testing.T) {
	t.Parallel()

	const defaultNamespace = "litmus"

	testCases := []struct {
		name           string
		pods           []runtime.Object
		selectors      []string
		expectedStatus bool
	}{
		{
			name: "all selectors healthy",
			pods: []runtime.Object{
				readyPod("exp-1", defaultNamespace, map[string]string{"app": "chaos-exporter"}),
				readyPod("op-1", defaultNamespace, map[string]string{"name": "chaos-operator"}),
			},
			selectors:      []string{"app=chaos-exporter", "name=chaos-operator"},
			expectedStatus: true,
		},
		{
			name: "one selector missing pods",
			pods: []runtime.Object{
				readyPod("exp-1", defaultNamespace, map[string]string{"app": "chaos-exporter"}),
			},
			selectors:      []string{"app=chaos-exporter", "name=chaos-operator"},
			expectedStatus: false,
		},
		{
			name: "one selector unhealthy",
			pods: []runtime.Object{
				readyPod("exp-1", defaultNamespace, map[string]string{"app": "chaos-exporter"}),
				notRunningPod("op-1", defaultNamespace, map[string]string{"name": "chaos-operator"}),
			},
			selectors:      []string{"app=chaos-exporter", "name=chaos-operator"},
			expectedStatus: false,
		},
		{
			name:           "empty selector list",
			pods:           []runtime.Object{},
			selectors:      []string{},
			expectedStatus: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			client := kubefake.NewSimpleClientset(tc.pods...)
			got := allDeploymentsHealthy(context.Background(), client, defaultNamespace, tc.selectors)

			if got != tc.expectedStatus {
				t.Fatalf("allDeploymentsHealthy() = %v, expectedStatus %v", got, tc.expectedStatus)
			}
		})
	}
}
