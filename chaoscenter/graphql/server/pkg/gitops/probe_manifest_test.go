package gitops

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/litmuschaos/litmus/chaoscenter/graphql/server/graph/model"
)

const httpProbeManifestYAML = `
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata:
  name: http-health-check
  description: HTTP probe to check application health endpoint
  tags:
    - health-check
    - http
spec:
  type: httpProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: "5s"
    interval: "2s"
    attempt: 3
    retry: 1
    probePollingInterval: "1s"
    initialDelay: "3s"
    evaluationTimeout: "10s"
    stopOnFailure: false
    url: http://my-app.default.svc:8080/health
    insecureSkipVerify: true
    method:
      get:
        criteria: "=="
        responseCode: "200"
`

func TestParseProbeManifest_HTTPGet(t *testing.T) {
	req, err := parseProbeManifest([]byte(httpProbeManifestYAML))
	require.NoError(t, err)

	assert.Equal(t, "http-health-check", req.Name)
	require.NotNil(t, req.Description)
	assert.Equal(t, "HTTP probe to check application health endpoint", *req.Description)
	assert.Equal(t, []string{"health-check", "http"}, req.Tags)
	assert.Equal(t, model.ProbeTypeHTTPProbe, req.Type)
	assert.Equal(t, model.InfrastructureTypeKubernetes, req.InfrastructureType)
	assert.Nil(t, req.KubernetesCMDProperties)
	assert.Nil(t, req.PromProperties)
	assert.Nil(t, req.K8sProperties)

	p := req.KubernetesHTTPProperties
	require.NotNil(t, p)
	assert.Equal(t, "5s", p.ProbeTimeout)
	assert.Equal(t, "2s", p.Interval)
	assert.Equal(t, "http://my-app.default.svc:8080/health", p.URL)
	assert.Equal(t, 3, *p.Attempt)
	assert.Equal(t, 1, *p.Retry)
	assert.Equal(t, "1s", *p.ProbePollingInterval)
	assert.Equal(t, "3s", *p.InitialDelay)
	assert.Equal(t, "10s", *p.EvaluationTimeout)
	assert.False(t, *p.StopOnFailure)
	assert.True(t, *p.InsecureSkipVerify)
	require.NotNil(t, p.Method)
	require.NotNil(t, p.Method.Get)
	assert.Nil(t, p.Method.Post)
	assert.Equal(t, "==", p.Method.Get.Criteria)
	assert.Equal(t, "200", p.Method.Get.ResponseCode)
}

func TestParseProbeManifest_HTTPPostAcceptsJSON(t *testing.T) {
	manifest := `{
		"apiVersion": "litmuschaos.io/v1alpha1",
		"kind": "ResilienceProbe",
		"metadata": {"name": "http-post-check"},
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
	}`

	req, err := parseProbeManifest([]byte(manifest))
	require.NoError(t, err)

	post := req.KubernetesHTTPProperties.Method.Post
	require.NotNil(t, post)
	assert.Nil(t, req.KubernetesHTTPProperties.Method.Get)
	assert.Equal(t, "201", post.ResponseCode)
	assert.Equal(t, "application/json", *post.ContentType)
	assert.Equal(t, `{"test": true}`, *post.Body)
	assert.Nil(t, post.BodyPath)
}

func TestParseProbeManifest_CMD(t *testing.T) {
	manifest := `
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata:
  name: cmd-probe
spec:
  type: cmdProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: "10s"
    interval: "5s"
    command: echo test
    source: '{"image":"busybox"}'
    comparator:
      type: string
      criteria: "=="
      value: test
`
	req, err := parseProbeManifest([]byte(manifest))
	require.NoError(t, err)

	assert.Equal(t, model.ProbeTypeCmdProbe, req.Type)
	p := req.KubernetesCMDProperties
	require.NotNil(t, p)
	assert.Equal(t, "echo test", p.Command)
	assert.Equal(t, `{"image":"busybox"}`, *p.Source)
	assert.Equal(t, &model.ComparatorInput{Type: "string", Criteria: "==", Value: "test"}, p.Comparator)
}

func TestParseProbeManifest_Prom(t *testing.T) {
	manifest := `
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata:
  name: prom-probe
spec:
  type: promProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: "10s"
    interval: "5s"
    endpoint: http://prometheus:9090
    query: up{job="api"}
    comparator:
      type: int
      criteria: ">="
      value: "1"
`
	req, err := parseProbeManifest([]byte(manifest))
	require.NoError(t, err)

	assert.Equal(t, model.ProbeTypePromProbe, req.Type)
	p := req.PromProperties
	require.NotNil(t, p)
	assert.Equal(t, "http://prometheus:9090", p.Endpoint)
	assert.Equal(t, `up{job="api"}`, *p.Query)
	assert.Nil(t, p.QueryPath)
	assert.Equal(t, ">=", p.Comparator.Criteria)
}

func TestParseProbeManifest_K8s(t *testing.T) {
	manifest := `
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata:
  name: k8s-probe
spec:
  type: k8sProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: "10s"
    interval: "5s"
    group: apps
    version: v1
    resource: deployments
    namespace: default
    labelSelector: app=nginx
    operation: present
`
	req, err := parseProbeManifest([]byte(manifest))
	require.NoError(t, err)

	assert.Equal(t, model.ProbeTypeK8sProbe, req.Type)
	p := req.K8sProperties
	require.NotNil(t, p)
	assert.Equal(t, "apps", *p.Group)
	assert.Equal(t, "v1", p.Version)
	assert.Equal(t, "deployments", p.Resource)
	assert.Equal(t, "default", *p.Namespace)
	assert.Equal(t, "app=nginx", *p.LabelSelector)
	assert.Equal(t, "present", p.Operation)
	assert.Nil(t, p.FieldSelector)
	assert.Nil(t, p.ResourceNames)
}

func TestParseProbeManifest_KindIsCaseInsensitive(t *testing.T) {
	manifest := `
apiVersion: litmuschaos.io/v1alpha1
kind: resilienceprobe
metadata:
  name: k8s-probe
spec:
  type: k8sProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: "10s"
    interval: "5s"
    version: v1
    resource: pods
    operation: present
`
	_, err := parseProbeManifest([]byte(manifest))
	assert.NoError(t, err)
}

func TestParseProbeManifest_IgnoresLabelsAndAnnotations(t *testing.T) {
	manifest := `
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata:
  name: k8s-probe
  labels:
    team: platform
  annotations:
    argocd.argoproj.io/sync-wave: "1"
spec:
  type: k8sProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: "10s"
    interval: "5s"
    version: v1
    resource: pods
    operation: present
`
	req, err := parseProbeManifest([]byte(manifest))

	require.NoError(t, err)
	assert.Equal(t, "k8s-probe", req.Name)
	assert.Nil(t, req.Tags)
}

func TestParseProbeManifest_Errors(t *testing.T) {
	// base is a minimal valid K8s probe; each case mutates one aspect of it.
	base := func(spec string) string {
		return `
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata:
  name: some-probe
spec:
` + spec
	}
	k8sProps := `
    probeTimeout: "10s"
    interval: "5s"
    version: v1
    resource: pods
    operation: present`

	testCases := []struct {
		name     string
		manifest string
		wantErr  string
	}{
		{
			name:     "not yaml",
			manifest: "{ this is: [not yaml",
			wantErr:  "invalid manifest",
		},
		{
			name: "wrong kind",
			manifest: `
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: some-probe
spec: {}
`,
			wantErr: `unsupported kind "ChaosEngine"`,
		},
		{
			name: "wrong apiVersion",
			manifest: `
apiVersion: v1
kind: ResilienceProbe
metadata:
  name: some-probe
spec: {}
`,
			wantErr: `unsupported apiVersion "v1"`,
		},
		{
			name: "missing name",
			manifest: `
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata: {}
spec: {}
`,
			wantErr: "metadata.name is required",
		},
		{
			name:     "unknown top-level field",
			manifest: base("  type: k8sProbe\n  infrastructureType: Kubernetes\n  properties:" + k8sProps + "\nstatus: {}\n"),
			wantErr:  `unknown field "status"`,
		},
		{
			name:     "invalid type",
			manifest: base("  type: dnsProbe\n  infrastructureType: Kubernetes\n  properties:" + k8sProps),
			wantErr:  `unsupported spec.type "dnsProbe"`,
		},
		{
			name:     "invalid infrastructureType",
			manifest: base("  type: k8sProbe\n  infrastructureType: Linux\n  properties:" + k8sProps),
			wantErr:  `unsupported spec.infrastructureType "Linux"`,
		},
		{
			name:     "missing properties",
			manifest: base("  type: k8sProbe\n  infrastructureType: Kubernetes\n"),
			wantErr:  "spec.properties is required",
		},
		{
			name:     "unknown property",
			manifest: base("  type: k8sProbe\n  infrastructureType: Kubernetes\n  properties:" + k8sProps + "\n    timeout: 1s"),
			wantErr:  `unknown field "timeout"`,
		},
		{
			name:     "properties of a different probe type",
			manifest: base("  type: httpProbe\n  infrastructureType: Kubernetes\n  properties:" + k8sProps),
			wantErr:  "invalid spec.properties: json: unknown field",
		},
		{
			name:     "k8s missing required fields",
			manifest: base("  type: k8sProbe\n  infrastructureType: Kubernetes\n  properties:\n    probeTimeout: 1s\n"),
			wantErr:  "missing required spec.properties: interval, operation, resource, version",
		},
		{
			name: "http missing method",
			manifest: base(`  type: httpProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: 1s
    interval: 1s
    url: http://example.com
`),
			wantErr: "spec.properties.method must define either get or post",
		},
		{
			name: "http both methods",
			manifest: base(`  type: httpProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: 1s
    interval: 1s
    url: http://example.com
    method:
      get: {criteria: "==", responseCode: "200"}
      post: {criteria: "==", responseCode: "200"}
`),
			wantErr: "spec.properties.method must define only one of get or post",
		},
		{
			name: "http get missing responseCode",
			manifest: base(`  type: httpProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: 1s
    interval: 1s
    url: http://example.com
    method:
      get: {criteria: "=="}
`),
			wantErr: "missing required spec.properties: method.get.responseCode",
		},
		{
			name: "cmd missing comparator",
			manifest: base(`  type: cmdProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: 1s
    interval: 1s
    command: echo
`),
			wantErr: "spec.properties.comparator is required",
		},
		{
			name: "prom comparator missing fields",
			manifest: base(`  type: promProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: 1s
    interval: 1s
    endpoint: http://prom
    comparator:
      type: int
`),
			wantErr: "missing required spec.properties: comparator.criteria, comparator.value",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req, err := parseProbeManifest([]byte(tc.manifest))
			require.Error(t, err)
			assert.Nil(t, req)
			assert.Contains(t, err.Error(), tc.wantErr)
		})
	}
}
