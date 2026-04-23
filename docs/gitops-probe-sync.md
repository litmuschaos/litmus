# GitOps Sync for Resilience Probes

## Overview

LitmusChaos now supports full GitOps synchronization for Resilience Probes. This feature enables you to define, version control, and manage your probes directly from your Git repository, providing a declarative approach to probe management.

## Features

- **Declarative Probe Management**: Define probes as YAML manifests in your Git repository
- **Automatic Synchronization**: Probes are automatically synced from Git to ChaosCenter
- **Idempotent Operations**: Create, update, and delete operations are handled automatically
- **Version Control**: Track probe changes through Git history
- **Multi-Probe Support**: Supports all probe types (HTTP, CMD, Prometheus, K8s)

## Repository Structure

Probes should be placed in a dedicated directory within your GitOps repository:

```
<your-gitops-repo>/
├── litmus/
│   ├── <project-id>/
│   │   ├── experiments/
│   │   │   ├── experiment-1.yaml
│   │   │   └── experiment-2.yaml
│   │   └── probes/
│   │       ├── http-health-check.yaml
│   │       ├── cmd-status-check.yaml
│   │       ├── prom-cpu-check.yaml
│   │       └── k8s-deployment-check.yaml
```

**Note**: The `probes/` directory is recommended but not mandatory. Probes can be placed anywhere in the repository structure as long as they follow the `ResilienceProbe` kind specification.

## Probe Manifest Format

All probe manifests must follow this structure:

```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata:
  name: <probe-name>
  description: "<probe-description>"
  tags:
    - <tag1>
    - <tag2>
spec:
  type: <probeType>  # httpProbe, cmdProbe, promProbe, k8sProbe
  infrastructureType: Kubernetes
  properties:
    # Type-specific properties
```

### Supported Probe Types

#### 1. HTTP Probe

```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata:
  name: http-health-check
  description: "HTTP probe to check application health endpoint"
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
    url: "http://my-app-service.default.svc.cluster.local:8080/health"
    insecureSkipVerify: false
    method:
      get:
        criteria: "=="
        responseCode: "200"
```

**HTTP POST Method Example:**

```yaml
    method:
      post:
        criteria: "=="
        responseCode: "200"
        contentType: "application/json"
        body: '{"status": "check"}'
```

#### 2. CMD Probe

```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata:
  name: pod-status-check
  description: "CMD probe to verify pod status"
  tags:
    - kubernetes
    - pod-check
spec:
  type: cmdProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: "10s"
    interval: "5s"
    attempt: 2
    retry: 1
    probePollingInterval: "2s"
    initialDelay: "5s"
    evaluationTimeout: "15s"
    stopOnFailure: true
    command: "kubectl get pods -n default -l app=my-app --field-selector=status.phase=Running --no-headers | wc -l"
    comparator:
      type: "int"
      criteria: ">="
      value: "3"
```

#### 3. Prometheus Probe

```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata:
  name: cpu-usage-check
  description: "Prometheus probe to monitor CPU usage"
  tags:
    - prometheus
    - metrics
spec:
  type: promProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: "5s"
    interval: "3s"
    attempt: 3
    retry: 2
    probePollingInterval: "1s"
    initialDelay: "2s"
    evaluationTimeout: "10s"
    stopOnFailure: false
    endpoint: "http://prometheus-service.monitoring.svc.cluster.local:9090"
    query: "avg(rate(container_cpu_usage_seconds_total{namespace='default'}[5m])) * 100"
    comparator:
      type: "float"
      criteria: "<"
      value: "80"
```

#### 4. K8s Probe

```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata:
  name: deployment-ready-check
  description: "K8s probe to verify deployment readiness"
  tags:
    - kubernetes
    - deployment
spec:
  type: k8sProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: "10s"
    interval: "5s"
    attempt: 3
    retry: 1
    probePollingInterval: "2s"
    initialDelay: "5s"
    evaluationTimeout: "20s"
    stopOnFailure: false
    group: "apps"
    version: "v1"
    resource: "deployments"
    namespace: "default"
    fieldSelector: "metadata.name=my-app"
    labelSelector: "app=my-app"
    operation: "present"
```

## How It Works

### Sync Flow

```
Git Repository → GitOps Sync → ChaosCenter Database
```

1. **Detection**: GitOps sync service detects changes in the repository
2. **Parsing**: YAML manifests with `kind: ResilienceProbe` are identified
3. **Validation**: Probe schema and properties are validated
4. **Sync**: Probes are created or updated in ChaosCenter via the probe API

### Sync Behavior

- **Create**: If a probe doesn't exist in ChaosCenter, it will be created
- **Update**: If a probe exists, it will be updated with new properties
- **Delete**: If a probe file is removed from Git, it will be deleted from ChaosCenter
- **Idempotent**: Running sync multiple times produces the same result

### Sync Frequency

The GitOps sync runs automatically every 2 minutes by default. You can also trigger manual sync through the ChaosCenter UI or API.

## Usage Guide

### Step 1: Enable GitOps for Your Project

1. Navigate to your project in ChaosCenter
2. Go to Settings → GitOps
3. Configure your Git repository:
   - Repository URL
   - Branch
   - Authentication (SSH/Token/Basic)
4. Click "Enable GitOps"

### Step 2: Add Probe Manifests to Your Repository

Create probe YAML files in your repository:

```bash
mkdir -p litmus/<project-id>/probes
cd litmus/<project-id>/probes
```

Create a probe file (e.g., `http-health-check.yaml`):

```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ResilienceProbe
metadata:
  name: http-health-check
  description: "Health check for my application"
  tags:
    - production
    - health
spec:
  type: httpProbe
  infrastructureType: Kubernetes
  properties:
    probeTimeout: "5s"
    interval: "2s"
    url: "http://my-app:8080/health"
    method:
      get:
        criteria: "=="
        responseCode: "200"
```

### Step 3: Commit and Push

```bash
git add litmus/<project-id>/probes/http-health-check.yaml
git commit -m "Add HTTP health check probe"
git push origin main
```

### Step 4: Verify Sync

1. Wait for the next sync cycle (max 2 minutes)
2. Navigate to Resilience Probes in ChaosCenter
3. Verify your probe appears in the list

## Property Reference

### Common Properties (All Probe Types)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `probeTimeout` | string | Yes | Timeout for the probe execution (e.g., "5s", "10s") |
| `interval` | string | Yes | Interval between probe executions (e.g., "2s", "5s") |
| `attempt` | integer | No | Number of attempts for the probe |
| `retry` | integer | No | Number of retries on failure |
| `probePollingInterval` | string | No | Polling interval for continuous probes |
| `initialDelay` | string | No | Initial delay before probe execution |
| `evaluationTimeout` | string | No | Timeout for probe evaluation |
| `stopOnFailure` | boolean | No | Stop experiment on probe failure |

### HTTP Probe Specific

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `url` | string | Yes | HTTP endpoint URL |
| `insecureSkipVerify` | boolean | No | Skip TLS certificate verification |
| `method.get.criteria` | string | Yes (if GET) | Response code comparison criteria |
| `method.get.responseCode` | string | Yes (if GET) | Expected response code |
| `method.post.criteria` | string | Yes (if POST) | Response code comparison criteria |
| `method.post.responseCode` | string | Yes (if POST) | Expected response code |
| `method.post.contentType` | string | No | Content-Type header |
| `method.post.body` | string | No | Request body |
| `method.post.bodyPath` | string | No | Path to request body file |

### CMD Probe Specific

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `command` | string | Yes | Command to execute |
| `comparator.type` | string | Yes | Comparison type (int, float, string) |
| `comparator.criteria` | string | Yes | Comparison criteria (==, !=, <, >, <=, >=) |
| `comparator.value` | string | Yes | Expected value |
| `source` | string | No | Source configuration for command execution |

### Prometheus Probe Specific

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `endpoint` | string | Yes | Prometheus server endpoint |
| `query` | string | No | PromQL query |
| `queryPath` | string | No | Path to query file |
| `comparator.type` | string | Yes | Comparison type (int, float) |
| `comparator.criteria` | string | Yes | Comparison criteria |
| `comparator.value` | string | Yes | Expected value |

### K8s Probe Specific

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `group` | string | No | API group (e.g., "apps") |
| `version` | string | Yes | API version (e.g., "v1") |
| `resource` | string | Yes | Resource type (e.g., "deployments") |
| `namespace` | string | No | Kubernetes namespace |
| `resourceNames` | string | No | Specific resource names |
| `fieldSelector` | string | No | Field selector |
| `labelSelector` | string | No | Label selector |
| `operation` | string | Yes | Operation type (present, absent, create, delete) |

## Best Practices

1. **Naming Convention**: Use descriptive, kebab-case names for probes
2. **Organization**: Group related probes in subdirectories
3. **Tagging**: Use meaningful tags for easy filtering and discovery
4. **Documentation**: Add clear descriptions to each probe
5. **Version Control**: Use meaningful commit messages when updating probes
6. **Testing**: Test probe configurations in a non-production environment first
7. **Validation**: Ensure all required properties are specified before committing

## Troubleshooting

### Probe Not Syncing

1. Check GitOps is enabled for your project
2. Verify the probe YAML syntax is correct
3. Check ChaosCenter logs for sync errors
4. Ensure the file has `.yaml` extension
5. Verify `kind: ResilienceProbe` is specified correctly

### Probe Sync Errors

Common errors and solutions:

| Error | Solution |
|-------|----------|
| "probe name is empty" | Ensure `metadata.name` is specified |
| "probe type is required" | Add `spec.type` field |
| "required properties missing" | Check all required properties for the probe type |
| "unsupported probe type" | Use valid probe type: httpProbe, cmdProbe, promProbe, k8sProbe |
| "file name doesn't match probe name" | Ensure filename matches `metadata.name` |

### Viewing Sync Logs

Check ChaosCenter server logs:

```bash
kubectl logs -n litmus deployment/litmusportal-server -f | grep -i "probe\|gitops"
```

## Limitations

- Only Kubernetes infrastructure type is currently supported
- Probe names must be unique within a project
- File name must match the probe name in metadata
- Bidirectional sync (ChaosCenter → Git) is not yet supported

## Migration Guide

### Migrating Existing Probes to GitOps

1. Export existing probes from ChaosCenter UI
2. Convert to ResilienceProbe YAML format
3. Add to your GitOps repository
4. Commit and push changes
5. Verify sync in ChaosCenter

## Examples

See the `examples/gitops/probes/` directory for complete working examples:

- `http-probe-example.yaml` - HTTP health check probe
- `cmd-probe-example.yaml` - Command execution probe
- `prom-probe-example.yaml` - Prometheus metrics probe
- `k8s-probe-example.yaml` - Kubernetes resource probe

## Related Documentation

- [GitOps Configuration Guide](./gitops-configuration.md)
- [Resilience Probes Overview](./resilience-probes.md)
- [Chaos Experiments with Probes](./experiments-with-probes.md)

## Support

For issues or questions:
- GitHub Issues: https://github.com/litmuschaos/litmus/issues
- Slack Community: https://slack.litmuschaos.io
- Documentation: https://docs.litmuschaos.io
