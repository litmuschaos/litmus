# GitOps Probe Examples

This directory contains example probe manifests for GitOps synchronization with LitmusChaos.

## Overview

These examples demonstrate how to define Resilience Probes as YAML manifests in your GitOps repository. Each probe type (HTTP, CMD, Prometheus, K8s) has a complete working example.

## Quick Start

1. **Copy an example to your GitOps repository:**
   ```bash
   cp http-probe-example.yaml <your-repo>/litmus/<project-id>/probes/my-probe.yaml
   ```

2. **Customize the probe:**
   - Update `metadata.name` to match your use case
   - Modify `spec.properties` as needed
   - Add relevant tags

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add resilience probe"
   git push
   ```

4. **Verify sync:**
   - Wait up to 2 minutes for GitOps sync
   - Check ChaosCenter UI → Resilience Probes
   - Your probe should appear in the list

## Examples

### 1. HTTP Probe (`http-probe-example.yaml`)

**Use Case:** Check application health endpoint

**Features:**
- HTTP GET request
- Response code validation
- Configurable timeout and retry
- TLS verification control

**When to Use:**
- Health check endpoints
- API availability monitoring
- Service readiness checks

**Customization:**
```yaml
properties:
  url: "http://your-service:port/health"  # Change to your endpoint
  method:
    get:
      responseCode: "200"  # Expected response code
```

### 2. CMD Probe (`cmd-probe-example.yaml`)

**Use Case:** Execute commands to verify system state

**Features:**
- Custom command execution
- Output comparison (int, float, string)
- Flexible criteria (==, !=, <, >, <=, >=)

**When to Use:**
- Pod count verification
- Custom script execution
- System state validation
- Log analysis

**Customization:**
```yaml
properties:
  command: "your-command-here"  # Any shell command
  comparator:
    type: "int"      # int, float, or string
    criteria: ">="   # Comparison operator
    value: "3"       # Expected value
```

### 3. Prometheus Probe (`prom-probe-example.yaml`)

**Use Case:** Monitor metrics from Prometheus

**Features:**
- PromQL query execution
- Metric threshold validation
- Flexible comparisons
- Query file support

**When to Use:**
- CPU/Memory monitoring
- Custom metric validation
- SLO/SLI checks
- Performance thresholds

**Customization:**
```yaml
properties:
  endpoint: "http://prometheus:9090"  # Your Prometheus server
  query: "your_promql_query"          # PromQL query
  comparator:
    criteria: "<"    # Threshold comparison
    value: "80"      # Threshold value
```

### 4. K8s Probe (`k8s-probe-example.yaml`)

**Use Case:** Verify Kubernetes resource state

**Features:**
- Resource presence/absence checks
- Label and field selectors
- Multi-resource support
- Namespace scoping

**When to Use:**
- Deployment readiness
- Pod availability
- ConfigMap/Secret validation
- Resource state verification

**Customization:**
```yaml
properties:
  resource: "deployments"              # Resource type
  namespace: "your-namespace"          # Target namespace
  labelSelector: "app=your-app"        # Label filter
  operation: "present"                 # present or absent
```

## Common Properties

All probes support these common properties:

```yaml
properties:
  probeTimeout: "5s"           # Max time for probe execution
  interval: "2s"               # Time between probe runs
  attempt: 3                   # Number of attempts (optional)
  retry: 1                     # Number of retries (optional)
  probePollingInterval: "1s"   # Polling interval (optional)
  initialDelay: "2s"           # Delay before first probe (optional)
  evaluationTimeout: "10s"     # Max evaluation time (optional)
  stopOnFailure: false         # Stop experiment on failure (optional)
```

## File Naming

**Important:** The filename must match the probe name in `metadata.name`

✅ **Correct:**
```yaml
# File: http-health-check.yaml
metadata:
  name: http-health-check
```

❌ **Incorrect:**
```yaml
# File: probe.yaml
metadata:
  name: http-health-check
```

## Repository Structure

Recommended structure for your GitOps repository:

```
your-gitops-repo/
├── litmus/
│   └── <project-id>/
│       ├── experiments/
│       │   ├── pod-delete.yaml
│       │   └── network-latency.yaml
│       └── probes/
│           ├── http-health-check.yaml
│           ├── cmd-status-check.yaml
│           ├── prom-cpu-check.yaml
│           └── k8s-deployment-check.yaml
```

**Note:** The `probes/` subdirectory is recommended but not required. Probes can be placed anywhere in the repository as long as they have `kind: ResilienceProbe`.

## Tags

Use tags to organize and filter probes:

```yaml
metadata:
  tags:
    - production      # Environment
    - critical        # Priority
    - health-check    # Category
    - http            # Type
```

## Validation

Before committing, validate your probe manifest:

1. **Check YAML syntax:**
   ```bash
   yamllint your-probe.yaml
   ```

2. **Verify required fields:**
   - `metadata.name`
   - `spec.type`
   - `spec.infrastructureType`
   - `spec.properties.probeTimeout`
   - `spec.properties.interval`

3. **Check type-specific requirements:**
   - HTTP: `url`, `method`
   - CMD: `command`, `comparator`
   - PROM: `endpoint`, `comparator`
   - K8s: `version`, `resource`, `operation`

## Testing

Test your probe before using in production:

1. **Create in test environment:**
   ```bash
   cp your-probe.yaml test-repo/litmus/<test-project-id>/probes/
   git add . && git commit -m "Test probe" && git push
   ```

2. **Verify sync:**
   - Check ChaosCenter test project
   - Verify probe appears correctly
   - Check all properties are set

3. **Test with experiment:**
   - Create a test experiment
   - Add the probe
   - Run experiment
   - Verify probe executes correctly

4. **Promote to production:**
   ```bash
   cp your-probe.yaml prod-repo/litmus/<prod-project-id>/probes/
   git add . && git commit -m "Add production probe" && git push
   ```

## Troubleshooting

### Probe Not Appearing

1. Check GitOps is enabled for your project
2. Verify file has `.yaml` extension
3. Ensure `kind: ResilienceProbe` is correct
4. Check filename matches `metadata.name`
5. Wait up to 2 minutes for sync

### Validation Errors

Check ChaosCenter logs:
```bash
kubectl logs -n litmus deployment/litmusportal-server -f | grep -i probe
```

Common errors:
- Missing required fields
- Invalid probe type
- Incorrect property format
- Filename mismatch

### Sync Not Working

1. Verify GitOps configuration
2. Check Git authentication
3. Ensure repository is accessible
4. Check branch is correct
5. Review GitOps sync logs

## Best Practices

1. **Descriptive Names:** Use clear, descriptive probe names
   ```yaml
   name: http-api-health-check  # Good
   name: probe1                 # Bad
   ```

2. **Meaningful Descriptions:** Add context for other team members
   ```yaml
   description: "Checks API health endpoint during chaos experiments"
   ```

3. **Appropriate Tags:** Use consistent tagging strategy
   ```yaml
   tags:
     - production
     - api
     - health-check
   ```

4. **Reasonable Timeouts:** Set realistic timeout values
   ```yaml
   probeTimeout: "5s"   # Good for fast endpoints
   probeTimeout: "30s"  # Good for slow endpoints
   ```

5. **Version Control:** Use meaningful commit messages
   ```bash
   git commit -m "Add HTTP health check probe for API service"
   ```

6. **Documentation:** Add comments in YAML for complex configurations
   ```yaml
   # This probe checks if at least 3 pods are running
   command: "kubectl get pods ... | wc -l"
   ```

## Advanced Usage

### Multiple Probes

Create multiple probes for comprehensive validation:

```
probes/
├── http-frontend-health.yaml
├── http-backend-health.yaml
├── cmd-pod-count.yaml
├── prom-cpu-usage.yaml
└── k8s-deployment-ready.yaml
```

### Probe Reuse

Use the same probe across multiple experiments by referencing it in experiment manifests.

### Environment-Specific Probes

Organize probes by environment:

```
probes/
├── production/
│   ├── http-health-check.yaml
│   └── prom-cpu-check.yaml
└── staging/
    ├── http-health-check.yaml
    └── prom-cpu-check.yaml
```

## Additional Resources

- **Full Documentation:** `docs/gitops-probe-sync.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`
- **Test Examples:** `pkg/gitops/probe_sync_test.go`

## Support

- **GitHub Issues:** https://github.com/litmuschaos/litmus/issues
- **Documentation:** https://docs.litmuschaos.io
- **Slack Community:** https://slack.litmuschaos.io

---

**Happy Chaos Engineering!** 🚀
