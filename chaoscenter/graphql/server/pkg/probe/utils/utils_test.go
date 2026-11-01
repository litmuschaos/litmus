package utils_test

import (
	"encoding/json"
	"testing"

	"github.com/litmuschaos/chaos-operator/api/litmuschaos/v1alpha1"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	dbSchemaProbe "github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/database/mongodb/probe"
	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/pkg/probe/utils"
	"github.com/stretchr/testify/assert"
)

func TestAddKubernetesHTTPProbeProperties(t *testing.T) {
	t.Run("HTTP Probe with GET method", func(t *testing.T) {
		initialDelay := "2s"
		attempt := 3
		retry := 2
		pollingInterval := "1s"
		evalTimeout := "5s"
		stopOnFailure := true
		insecure := false

		req := model.ProbeRequest{
			KubernetesHTTPProperties: &model.KubernetesHTTPProbeRequest{
				ProbeTimeout:         "10s",
				Interval:             "2s",
				URL:                  "http://example.com/health",
				InitialDelay:         &initialDelay,
				Attempt:              &attempt,
				Retry:                &retry,
				ProbePollingInterval: &pollingInterval,
				EvaluationTimeout:    &evalTimeout,
				StopOnFailure:        &stopOnFailure,
				InsecureSkipVerify:   &insecure,
				Method: &model.MethodRequest{
					Get: &model.GETRequest{
						Criteria:     "==",
						ResponseCode: "200",
					},
				},
			},
		}

		probe := &dbSchemaProbe.Probe{}
		res := utils.AddKubernetesHTTPProbeProperties(probe, req)

		assert.NotNil(t, res.KubernetesHTTPProperties)
		assert.Equal(t, "http://example.com/health", res.KubernetesHTTPProperties.URL)
		assert.Equal(t, "10s", res.KubernetesHTTPProperties.ProbeTimeout)
		assert.Equal(t, &attempt, res.KubernetesHTTPProperties.Attempt)
		assert.Equal(t, &retry, res.KubernetesHTTPProperties.Retry)
		assert.NotNil(t, res.KubernetesHTTPProperties.Method.GET)
		assert.Equal(t, "==", res.KubernetesHTTPProperties.Method.GET.Criteria)
		assert.Equal(t, "200", res.KubernetesHTTPProperties.Method.GET.ResponseCode)
		assert.Nil(t, res.KubernetesHTTPProperties.Method.POST)
	})

	t.Run("HTTP Probe with POST method", func(t *testing.T) {
		contentType := "application/json"
		body := `{"test":"data"}`

		req := model.ProbeRequest{
			KubernetesHTTPProperties: &model.KubernetesHTTPProbeRequest{
				ProbeTimeout: "10s",
				Interval:     "2s",
				URL:          "http://example.com/api",
				Method: &model.MethodRequest{
					Post: &model.POSTRequest{
						Criteria:     "==",
						ResponseCode: "201",
						ContentType:  &contentType,
						Body:         &body,
					},
				},
			},
		}

		probe := &dbSchemaProbe.Probe{}
		res := utils.AddKubernetesHTTPProbeProperties(probe, req)

		assert.NotNil(t, res.KubernetesHTTPProperties)
		assert.NotNil(t, res.KubernetesHTTPProperties.Method.POST)
		assert.Equal(t, "201", res.KubernetesHTTPProperties.Method.POST.ResponseCode)
		assert.Equal(t, &contentType, res.KubernetesHTTPProperties.Method.POST.ContentType)
		assert.Equal(t, &body, res.KubernetesHTTPProperties.Method.POST.Body)
		assert.Nil(t, res.KubernetesHTTPProperties.Method.GET)
	})
}

func TestAddKubernetesCMDProbeProperties(t *testing.T) {
	t.Run("CMD Probe valid properties with source", func(t *testing.T) {
		sourceDetails := v1alpha1.SourceDetails{
			Image: "busybox:latest",
			Args:  []string{"echo", "hello"},
		}
		sourceJSON, err := json.Marshal(sourceDetails)
		assert.NoError(t, err)
		sourceStr := string(sourceJSON)

		req := model.ProbeRequest{
			KubernetesCMDProperties: &model.KubernetesCMDProbeRequest{
				ProbeTimeout: "15s",
				Interval:     "3s",
				Command:      "echo test",
				Comparator: &model.ComparatorInput{
					Type:     "string",
					Value:    "test",
					Criteria: "==",
				},
				Source: &sourceStr,
			},
		}

		probe := &dbSchemaProbe.Probe{}
		res, err := utils.AddKubernetesCMDProbeProperties(probe, req)

		assert.NoError(t, err)
		assert.NotNil(t, res.KubernetesCMDProperties)
		assert.Equal(t, "echo test", res.KubernetesCMDProperties.Command)
		assert.Equal(t, "test", res.KubernetesCMDProperties.Comparator.Value)
		assert.NotNil(t, res.KubernetesCMDProperties.Source)
		assert.Equal(t, "busybox:latest", res.KubernetesCMDProperties.Source.Image)
	})

	t.Run("CMD Probe with invalid source JSON", func(t *testing.T) {
		invalidSource := "{invalid-json"
		req := model.ProbeRequest{
			KubernetesCMDProperties: &model.KubernetesCMDProbeRequest{
				ProbeTimeout: "15s",
				Interval:     "3s",
				Command:      "echo test",
				Comparator: &model.ComparatorInput{
					Type:     "string",
					Value:    "test",
					Criteria: "==",
				},
				Source: &invalidSource,
			},
		}

		probe := &dbSchemaProbe.Probe{}
		res, err := utils.AddKubernetesCMDProbeProperties(probe, req)

		assert.Error(t, err)
		assert.Nil(t, res)
	})
}

func TestAddPROMProbeProperties(t *testing.T) {
	query := "up == 1"
	req := model.ProbeRequest{
		PromProperties: &model.PROMProbeRequest{
			ProbeTimeout: "10s",
			Interval:     "1s",
			Endpoint:     "http://prometheus:9090",
			Query:        &query,
			Comparator: &model.ComparatorInput{
				Type:     "float",
				Value:    "1",
				Criteria: "==",
			},
		},
	}

	probe := &dbSchemaProbe.Probe{}
	res := utils.AddPROMProbeProperties(probe, req)

	assert.NotNil(t, res.PROMProperties)
	assert.Equal(t, "http://prometheus:9090", res.PROMProperties.Endpoint)
	assert.Equal(t, &query, res.PROMProperties.Query)
	assert.Equal(t, "1", res.PROMProperties.Comparator.Value)
}

func TestAddK8SProbeProperties(t *testing.T) {
	namespace := "default"
	req := model.ProbeRequest{
		K8sProperties: &model.K8SProbeRequest{
			ProbeTimeout: "20s",
			Interval:     "5s",
			Version:      "v1",
			Resource:     "pods",
			Operation:    "present",
			Namespace:    &namespace,
		},
	}

	probe := &dbSchemaProbe.Probe{}
	res := utils.AddK8SProbeProperties(probe, req)

	assert.NotNil(t, res.K8SProperties)
	assert.Equal(t, "v1", res.K8SProperties.Version)
	assert.Equal(t, "pods", res.K8SProperties.Resource)
	assert.Equal(t, "present", res.K8SProperties.Operation)
	assert.Equal(t, &namespace, res.K8SProperties.Namespace)
}

func TestInsertProbeRefAnnotation(t *testing.T) {
	t.Run("Successfully insert probeRef into manifest with existing annotations", func(t *testing.T) {
		rawYaml := `
metadata:
  name: engine-1
  annotations:
    existing: annotation
`
		res, err := utils.InsertProbeRefAnnotation(rawYaml, "probe-ref-value")
		assert.NoError(t, err)
		assert.Contains(t, res, "probeRef: probe-ref-value")
		assert.Contains(t, res, "existing: annotation")
	})

	t.Run("Successfully insert probeRef into manifest without annotations", func(t *testing.T) {
		rawYaml := `
metadata:
  name: engine-2
`
		res, err := utils.InsertProbeRefAnnotation(rawYaml, "new-probe-ref")
		assert.NoError(t, err)
		assert.Contains(t, res, "probeRef: new-probe-ref")
	})

	t.Run("Error when metadata is missing", func(t *testing.T) {
		rawYaml := `
spec:
  appinfo: test
`
		_, err := utils.InsertProbeRefAnnotation(rawYaml, "ref")
		assert.Error(t, err)
		assert.Equal(t, "metadata not found", err.Error())
	})

	t.Run("Error when YAML is malformed", func(t *testing.T) {
		malformedYaml := `:::invalid-yaml`
		_, err := utils.InsertProbeRefAnnotation(malformedYaml, "ref")
		assert.Error(t, err)
	})
}

func TestProbeInputsToProbeRequestConverter(t *testing.T) {
	t.Run("Error when ProbeTimeout or Interval is missing", func(t *testing.T) {
		probeInputs := v1alpha1.ProbeAttributes{
			Name: "test-probe",
			Type: "httpProbe",
			RunProperties: v1alpha1.RunProperty{
				ProbeTimeout: "",
				Interval:     "5s",
			},
		}

		_, err := utils.ProbeInputsToProbeRequestConverter(probeInputs)
		assert.Error(t, err)
		assert.Equal(t, "values for ProbeTimeout and Interval are required", err.Error())
	})

	t.Run("HTTP Probe success conversion", func(t *testing.T) {
		probeInputs := v1alpha1.ProbeAttributes{
			Name: "http-check",
			Type: "httpProbe",
			RunProperties: v1alpha1.RunProperty{
				ProbeTimeout: "10s",
				Interval:     "2s",
			},
			HTTPProbeInputs: &v1alpha1.HTTPProbeInputs{
				URL: "https://httpbin.org/get",
				Method: v1alpha1.HTTPMethod{
					Get: &v1alpha1.GetMethod{
						Criteria:     "==",
						ResponseCode: "200",
					},
				},
			},
		}

		req, err := utils.ProbeInputsToProbeRequestConverter(probeInputs)
		assert.NoError(t, err)
		assert.Equal(t, model.ProbeTypeHTTPProbe, req.Type)
		assert.Contains(t, req.Name, "http-check")
		assert.NotNil(t, req.KubernetesHTTPProperties)
		assert.Equal(t, "https://httpbin.org/get", req.KubernetesHTTPProperties.URL)
	})

	t.Run("HTTP Probe failure when URL is missing", func(t *testing.T) {
		probeInputs := v1alpha1.ProbeAttributes{
			Name: "http-check-no-url",
			Type: "httpProbe",
			RunProperties: v1alpha1.RunProperty{
				ProbeTimeout: "10s",
				Interval:     "2s",
			},
			HTTPProbeInputs: &v1alpha1.HTTPProbeInputs{
				URL: "",
				Method: v1alpha1.HTTPMethod{
					Get: &v1alpha1.GetMethod{
						Criteria:     "==",
						ResponseCode: "200",
					},
				},
			},
		}

		_, err := utils.ProbeInputsToProbeRequestConverter(probeInputs)
		assert.Error(t, err)
		assert.Equal(t, "URL not specified", err.Error())
	})

	t.Run("Prometheus Probe success conversion", func(t *testing.T) {
		probeInputs := v1alpha1.ProbeAttributes{
			Name: "prom-check",
			Type: "promProbe",
			RunProperties: v1alpha1.RunProperty{
				ProbeTimeout: "10s",
				Interval:     "2s",
			},
			PromProbeInputs: &v1alpha1.PromProbeInputs{
				Endpoint: "http://prom:9090",
				Query:    "up == 1",
				Comparator: v1alpha1.ComparatorInfo{
					Type:     "float",
					Criteria: "==",
					Value:    "1",
				},
			},
		}

		req, err := utils.ProbeInputsToProbeRequestConverter(probeInputs)
		assert.NoError(t, err)
		assert.Equal(t, model.ProbeTypePromProbe, req.Type)
		assert.NotNil(t, req.PromProperties)
		assert.Equal(t, "http://prom:9090", req.PromProperties.Endpoint)
	})

	t.Run("K8s Probe failure when required fields missing", func(t *testing.T) {
		probeInputs := v1alpha1.ProbeAttributes{
			Name: "k8s-check",
			Type: "k8sProbe",
			RunProperties: v1alpha1.RunProperty{
				ProbeTimeout: "10s",
				Interval:     "2s",
			},
			K8sProbeInputs: &v1alpha1.K8sProbeInputs{
				Resource:  "",
				Operation: "present",
				Version:   "v1",
			},
		}

		_, err := utils.ProbeInputsToProbeRequestConverter(probeInputs)
		assert.Error(t, err)
		assert.Equal(t, "resource, operation and version are required", err.Error())
	})
}
