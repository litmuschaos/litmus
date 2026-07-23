package gitops

import (
	"testing"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
	"github.com/stretchr/testify/assert"
)

func TestParseHTTPProbeManifest(t *testing.T) {
	service := &gitOpsService{}

	testCases := []struct {
		name        string
		manifest    string
		expectError bool
		validate    func(*testing.T, *model.ProbeRequest)
	}{
		{
			name: "Valid HTTP GET Probe",
			manifest: `{
				"apiVersion": "litmuschaos.io/v1alpha1",
				"kind": "ResilienceProbe",
				"metadata": {
					"name": "http-health-check",
					"description": "Health check probe",
					"tags": ["health", "http"]
				},
				"spec": {
					"type": "httpProbe",
					"infrastructureType": "Kubernetes",
					"properties": {
						"probeTimeout": "5s",
						"interval": "2s",
						"url": "http://example.com/health",
						"method": {
							"get": {
								"criteria": "==",
								"responseCode": "200"
							}
						}
					}
				}
			}`,
			expectError: false,
			validate: func(t *testing.T, req *model.ProbeRequest) {
				assert.Equal(t, "http-health-check", req.Name)
				assert.Equal(t, model.ProbeTypeHTTPProbe, req.Type)
				assert.Equal(t, model.InfrastructureTypeKubernetes, req.InfrastructureType)
				assert.NotNil(t, req.KubernetesHTTPProperties)
				assert.Equal(t, "http://example.com/health", req.KubernetesHTTPProperties.URL)
				assert.Equal(t, "5s", req.KubernetesHTTPProperties.ProbeTimeout)
				assert.Equal(t, "2s", req.KubernetesHTTPProperties.Interval)
			},
		},
		{
			name: "Valid HTTP POST Probe",
			manifest: `{
				"apiVersion": "litmuschaos.io/v1alpha1",
				"kind": "ResilienceProbe",
				"metadata": {
					"name": "http-post-check"
				},
				"spec": {
					"type": "httpProbe",
					"infrastructureType": "Kubernetes",
					"properties": {
						"probeTimeout": "10s",
						"interval": "5s",
						"url": "http://example.com/api",
						"method": {
							"post": {
								"criteria": "==",
								"responseCode": "201",
								"contentType": "application/json",
								"body": "{\"test\": true}"
							}
						}
					}
				}
			}`,
			expectError: false,
			validate: func(t *testing.T, req *model.ProbeRequest) {
				assert.Equal(t, "http-post-check", req.Name)
				assert.NotNil(t, req.KubernetesHTTPProperties.Method.Post)
				assert.Equal(t, "201", req.KubernetesHTTPProperties.Method.Post.ResponseCode)
			},
		},
		{
			name: "Missing Required Fields",
			manifest: `{
				"apiVersion": "litmuschaos.io/v1alpha1",
				"kind": "ResilienceProbe",
				"metadata": {
					"name": "incomplete-probe"
				},
				"spec": {
					"type": "httpProbe",
					"infrastructureType": "Kubernetes",
					"properties": {
						"url": "http://example.com"
					}
				}
			}`,
			expectError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result, err := service.parseProbeManifest(tc.manifest)

			if tc.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				if tc.validate != nil {
					tc.validate(t, result)
				}
			}
		})
	}
}

func TestParseCMDProbeManifest(t *testing.T) {
	service := &gitOpsService{}

	manifest := `{
		"apiVersion": "litmuschaos.io/v1alpha1",
		"kind": "ResilienceProbe",
		"metadata": {
			"name": "cmd-probe-test",
			"description": "CMD probe for testing"
		},
		"spec": {
			"type": "cmdProbe",
			"infrastructureType": "Kubernetes",
			"properties": {
				"probeTimeout": "10s",
				"interval": "5s",
				"command": "echo 'test'",
				"comparator": {
					"type": "string",
					"criteria": "==",
					"value": "test"
				},
				"attempt": 3,
				"retry": 2
			}
		}
	}`

	result, err := service.parseProbeManifest(manifest)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "cmd-probe-test", result.Name)
	assert.Equal(t, model.ProbeTypeCmdProbe, result.Type)
	assert.NotNil(t, result.KubernetesCMDProperties)
	assert.Equal(t, "echo 'test'", result.KubernetesCMDProperties.Command)
	assert.Equal(t, "string", result.KubernetesCMDProperties.Comparator.Type)
	assert.NotNil(t, result.KubernetesCMDProperties.Attempt)
	assert.Equal(t, 3, *result.KubernetesCMDProperties.Attempt)
}

func TestParsePromProbeManifest(t *testing.T) {
	service := &gitOpsService{}

	manifest := `{
		"apiVersion": "litmuschaos.io/v1alpha1",
		"kind": "ResilienceProbe",
		"metadata": {
			"name": "prom-probe-test"
		},
		"spec": {
			"type": "promProbe",
			"infrastructureType": "Kubernetes",
			"properties": {
				"probeTimeout": "5s",
				"interval": "3s",
				"endpoint": "http://prometheus:9090",
				"query": "up{job='app'}",
				"comparator": {
					"type": "float",
					"criteria": ">=",
					"value": "1.0"
				}
			}
		}
	}`

	result, err := service.parseProbeManifest(manifest)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "prom-probe-test", result.Name)
	assert.Equal(t, model.ProbeTypePromProbe, result.Type)
	assert.NotNil(t, result.PromProperties)
	assert.Equal(t, "http://prometheus:9090", result.PromProperties.Endpoint)
	assert.NotNil(t, result.PromProperties.Query)
	assert.Equal(t, "up{job='app'}", *result.PromProperties.Query)
}

func TestParseK8SProbeManifest(t *testing.T) {
	service := &gitOpsService{}

	manifest := `{
		"apiVersion": "litmuschaos.io/v1alpha1",
		"kind": "ResilienceProbe",
		"metadata": {
			"name": "k8s-probe-test"
		},
		"spec": {
			"type": "k8sProbe",
			"infrastructureType": "Kubernetes",
			"properties": {
				"probeTimeout": "10s",
				"interval": "5s",
				"group": "apps",
				"version": "v1",
				"resource": "deployments",
				"namespace": "default",
				"operation": "present",
				"labelSelector": "app=test"
			}
		}
	}`

	result, err := service.parseProbeManifest(manifest)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "k8s-probe-test", result.Name)
	assert.Equal(t, model.ProbeTypeK8sProbe, result.Type)
	assert.NotNil(t, result.K8sProperties)
	assert.Equal(t, "v1", result.K8sProperties.Version)
	assert.Equal(t, "deployments", result.K8sProperties.Resource)
	assert.Equal(t, "present", result.K8sProperties.Operation)
	assert.NotNil(t, result.K8sProperties.Namespace)
	assert.Equal(t, "default", *result.K8sProperties.Namespace)
}

func TestParseProbeManifest_InvalidType(t *testing.T) {
	service := &gitOpsService{}

	manifest := `{
		"apiVersion": "litmuschaos.io/v1alpha1",
		"kind": "ResilienceProbe",
		"metadata": {
			"name": "invalid-probe"
		},
		"spec": {
			"type": "invalidProbe",
			"infrastructureType": "Kubernetes",
			"properties": {}
		}
	}`

	result, err := service.parseProbeManifest(manifest)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "unsupported probe type")
}

func TestParseProbeManifest_MissingName(t *testing.T) {
	service := &gitOpsService{}

	manifest := `{
		"apiVersion": "litmuschaos.io/v1alpha1",
		"kind": "ResilienceProbe",
		"metadata": {},
		"spec": {
			"type": "httpProbe",
			"infrastructureType": "Kubernetes",
			"properties": {
				"probeTimeout": "5s",
				"interval": "2s",
				"url": "http://example.com"
			}
		}
	}`

	result, err := service.parseProbeManifest(manifest)

	assert.Error(t, err)
	assert.Nil(t, result)
	assert.Contains(t, err.Error(), "probe name is required")
}

func TestParseProbeManifest_WithTags(t *testing.T) {
	service := &gitOpsService{}

	manifest := `{
		"apiVersion": "litmuschaos.io/v1alpha1",
		"kind": "ResilienceProbe",
		"metadata": {
			"name": "tagged-probe",
			"description": "Probe with tags",
			"tags": ["production", "critical", "health-check"]
		},
		"spec": {
			"type": "httpProbe",
			"infrastructureType": "Kubernetes",
			"properties": {
				"probeTimeout": "5s",
				"interval": "2s",
				"url": "http://example.com",
				"method": {
					"get": {
						"criteria": "==",
						"responseCode": "200"
					}
				}
			}
		}
	}`

	result, err := service.parseProbeManifest(manifest)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "tagged-probe", result.Name)
	assert.NotNil(t, result.Description)
	assert.Equal(t, "Probe with tags", *result.Description)
	assert.Len(t, result.Tags, 3)
	assert.Contains(t, result.Tags, "production")
	assert.Contains(t, result.Tags, "critical")
	assert.Contains(t, result.Tags, "health-check")
}

func TestParseHTTPProbeProperties_OptionalFields(t *testing.T) {
	service := &gitOpsService{}

	manifest := `{
		"spec": {
			"properties": {
				"probeTimeout": "5s",
				"interval": "2s",
				"url": "http://example.com",
				"attempt": 5,
				"retry": 3,
				"probePollingInterval": "1s",
				"initialDelay": "2s",
				"evaluationTimeout": "10s",
				"stopOnFailure": true,
				"insecureSkipVerify": true,
				"method": {
					"get": {
						"criteria": "==",
						"responseCode": "200"
					}
				}
			}
		}
	}`

	result, err := service.parseHTTPProbeProperties(manifest)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.NotNil(t, result.Attempt)
	assert.Equal(t, 5, *result.Attempt)
	assert.NotNil(t, result.Retry)
	assert.Equal(t, 3, *result.Retry)
	assert.NotNil(t, result.ProbePollingInterval)
	assert.Equal(t, "1s", *result.ProbePollingInterval)
	assert.NotNil(t, result.InitialDelay)
	assert.Equal(t, "2s", *result.InitialDelay)
	assert.NotNil(t, result.EvaluationTimeout)
	assert.Equal(t, "10s", *result.EvaluationTimeout)
	assert.NotNil(t, result.StopOnFailure)
	assert.True(t, *result.StopOnFailure)
	assert.NotNil(t, result.InsecureSkipVerify)
	assert.True(t, *result.InsecureSkipVerify)
}

func TestParseCMDProbeProperties_WithSource(t *testing.T) {
	service := &gitOpsService{}

	manifest := `{
		"spec": {
			"properties": {
				"probeTimeout": "10s",
				"interval": "5s",
				"command": "test command",
				"comparator": {
					"type": "int",
					"criteria": ">=",
					"value": "1"
				},
				"source": "{\"image\":\"busybox\",\"hostNetwork\":false}"
			}
		}
	}`

	result, err := service.parseCMDProbeProperties(manifest)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.NotNil(t, result.Source)
	assert.Contains(t, *result.Source, "busybox")
}

func TestParsePromProbeProperties_WithQueryPath(t *testing.T) {
	service := &gitOpsService{}

	manifest := `{
		"spec": {
			"properties": {
				"probeTimeout": "5s",
				"interval": "3s",
				"endpoint": "http://prometheus:9090",
				"queryPath": "/path/to/query.promql",
				"comparator": {
					"type": "float",
					"criteria": "<",
					"value": "100.0"
				}
			}
		}
	}`

	result, err := service.parsePromProbeProperties(manifest)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.NotNil(t, result.QueryPath)
	assert.Equal(t, "/path/to/query.promql", *result.QueryPath)
}

func TestParseK8SProbeProperties_AllFields(t *testing.T) {
	service := &gitOpsService{}

	manifest := `{
		"spec": {
			"properties": {
				"probeTimeout": "10s",
				"interval": "5s",
				"group": "apps",
				"version": "v1",
				"resource": "deployments",
				"resourceNames": "my-deployment",
				"namespace": "production",
				"fieldSelector": "metadata.name=my-app",
				"labelSelector": "app=my-app,tier=backend",
				"operation": "present",
				"attempt": 3,
				"retry": 2,
				"probePollingInterval": "2s",
				"initialDelay": "5s",
				"evaluationTimeout": "20s",
				"stopOnFailure": false
			}
		}
	}`

	result, err := service.parseK8SProbeProperties(manifest)

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.NotNil(t, result.Group)
	assert.Equal(t, "apps", *result.Group)
	assert.NotNil(t, result.ResourceNames)
	assert.Equal(t, "my-deployment", *result.ResourceNames)
	assert.NotNil(t, result.Namespace)
	assert.Equal(t, "production", *result.Namespace)
	assert.NotNil(t, result.FieldSelector)
	assert.Equal(t, "metadata.name=my-app", *result.FieldSelector)
	assert.NotNil(t, result.LabelSelector)
	assert.Equal(t, "app=my-app,tier=backend", *result.LabelSelector)
}
