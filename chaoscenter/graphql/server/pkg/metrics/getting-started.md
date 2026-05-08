# Getting Started with LitmusChaos Control Plane Metrics

This guide explains how to set up Prometheus scraping and Grafana visualization for the LitmusChaos GraphQL server metrics.

## Prerequisites

- LitmusChaos installed on a Kubernetes cluster
- [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) installed via Helm (includes Prometheus and Grafana)

---

## Step 1: Verify the Metrics Endpoint

The GraphQL server exposes Prometheus metrics on port `8889` at `/metrics`. This port is configurable via the `METRICS_PORT` environment variable.

Verify the metrics server is running:

```bash
kubectl port-forward -n litmus deployment/litmusportal-server 8889:8889
curl http://localhost:8889/metrics | grep litmus_
```

You should see metrics like `litmus_api_requests_total`, `litmus_experiment_runs_total`, and `litmus_experiment_status`.

---

## Step 2: Create the Metrics Service

Create a Kubernetes Service to expose the metrics port:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: litmus-server-metrics
  namespace: litmus
  labels:
    app: litmus-server-metrics
spec:
  selector:
    component: litmusportal-server
  ports:
    - name: metrics
      port: 8889
      targetPort: 8889
  type: ClusterIP
```

Apply it:

```bash
kubectl apply -f litmus-server-metrics-service.yaml
```

---

## Step 3: Create a ServiceMonitor

Create a `ServiceMonitor` so Prometheus automatically discovers and scrapes the metrics:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: litmus-server-metrics
  namespace: litmus
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app: litmus-server-metrics
  endpoints:
    - port: metrics
      path: /metrics
      interval: 30s
```

Apply it:

```bash
kubectl apply -f litmus-server-metrics-monitor.yaml
```

> **Note:** The `release: prometheus` label must match the label selector configured in your Prometheus operator. If you used a different Helm release name, update this label accordingly.

---

## Step 4: Verify Prometheus is Scraping

Port-forward to Prometheus and verify the target is being scraped:

```bash
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
```

Open `http://localhost:9090/targets` and look for `litmus-server-metrics`. It should show as `UP`.

You can also run a query in the Prometheus UI:

```
litmus_api_requests_total
```

---

## Step 5: Import the Grafana Dashboard

A pre-built Grafana dashboard is included at:

```
chaoscenter/graphql/server/grafana/litmuschaos-metrics-dashboard.json
```

To import it:

1. Port-forward to Grafana:
```bash
kubectl port-forward -n monitoring deployment/prometheus-grafana 3000:3000
```

2. Open `http://localhost:3000` and log in.

3. Go to **Dashboards → New → Import**.

4. Upload `litmuschaos-metrics-dashboard.json`.

5. Select **Prometheus** as the datasource and click **Import**.

The dashboard includes panels for:
- API request rate and response time
- Experiment run counts and durations
- Experiment status (active vs completed)
- Infra agent counts

---

## Available Metrics

See [README.md](./README.md) for the full list of metrics, their labels, and descriptions.
