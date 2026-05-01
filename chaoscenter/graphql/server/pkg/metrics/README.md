# LitmusChaos GraphQL Server Metrics

This document explains the Prometheus metrics exposed by the LitmusChaos GraphQL server.

**Metrics Endpoint:** `http://localhost:8889/metrics`  
**Port:** Configurable via `METRICS_PORT` environment variable (default: 8889)

---

## Available Metrics

### API Metrics

**`litmus_api_requests_total`**  
Counts total API requests to the GraphQL server.  
Labels: `endpoint`, `status`

**`litmus_api_response_time_milliseconds`**  
Tracks how long API requests take to respond (in milliseconds).  
Labels: `endpoint`  
Type: Histogram with buckets from 10ms to 5s

**`litmus_api_error_requests_total`**  
Counts API requests that resulted in errors.  
Labels: `endpoint`, `error_type`

**`litmus_api_authentication_failures_total`**  
Counts failed authentication attempts.  
Labels: `auth_method`

---

### GraphQL Metrics

**`litmus_graphql_operations_total`**  
Counts GraphQL operations executed (queries and mutations).  
Labels: `operation_name`, `operation_type`  
Example operations: `listExperiment`, `runChaosExperiment`, `getExperiment`

---

### Experiment Metrics

**`litmus_experiments_total`**  
Shows total number of experiments in the system.  
Labels: `project_id`, `status`

**`litmus_experiment_runs_total`**  
Counts how many times experiments have been run.  
Labels: `project_id`, `experiment_id`, `experiment_name`, `status`  
Status values: `started`, `passed`, `failed`, `stopped`

**`litmus_experiment_run_duration_seconds`**  
Tracks how long experiment runs take (in seconds).  
Labels: `project_id`, `experiment_id`, `experiment_name`  
Type: Histogram with buckets from 1s to 30 minutes

---

### Agent Metrics

**`litmus_connected_agents`**  
Shows number of chaos agents currently connected.  
Labels: `project_id`

**`litmus_disconnected_agents`**  
Shows number of chaos agents that are disconnected.  
Labels: `project_id`

**`litmus_total_agents`**  
Shows total number of registered agents.  
Labels: `project_id`

---

## How to Use

Access the metrics endpoint:
```bash
curl http://localhost:8889/metrics
```

Or configure Prometheus to scrape from your GraphQL server on port 8889.
