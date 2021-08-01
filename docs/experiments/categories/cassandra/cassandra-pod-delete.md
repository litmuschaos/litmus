## Cassandra pod delete

It deletes the Cassandra pods with matching namespace, labels, and kind provided at `spec.appinfo` in chaosengine for the `TOTAL_CHAOS_DURATION` duration. 

### Common Experiment Tunables

Refer the [common attributes](../common/common.md) to tune the common tunables for all the experiments.

### Cassandra App Details

It tunes the cassandra service name at `CASSANDRA_SVC_NAME` and cassandra port at `CASSANDRA_PORT`. 

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/cassandra/cassandra-pod-delete/cassandra-app-details.yaml yaml)
```yaml
## contains details of cassandra application
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "cassandra"
    applabel: "app=cassandra"
    appkind: "statefulset"
  chaosServiceAccount: casssandra-pod-delete-sa
  experiments:
  - name: casssandra-pod-delete
    spec:
      components:
        env:
        # name of the cassandra service
        - name: CASSANDRA_SVC_NAME
          value: 'cassandra'
        # name of the cassandra port
        - name: CASSANDRA_PORT
          value: '9042'
        # percentage of cassandra replicas with matching labels
        - name: PODS_AFFECTED_PERC
          value: '100'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Force Delete

The cassandra pod can be deleted `forcefully` or `gracefully`. It can be tuned with the `FORCE` env. It will delete the pod forcefully if `FORCE` is provided as `true` and it will delete the pod gracefully if `FORCE` is provided as `false`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/cassandra/cassandra-pod-delete/force-delete.yaml yaml)
```yaml
## force env provided to forcefully or gracefully delete the pod
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "cassandra"
    applabel: "app=cassandra"
    appkind: "statefulset"
  chaosServiceAccount: casssandra-pod-delete-sa
  experiments:
  - name: casssandra-pod-delete
    spec:
      components:
        env:
        # deletes the cassandra pod forcefully or gracefully
        # supports: true, false. default: false
        - name: FORCE
          value: 'true'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Liveness check of cassandra

- The cassandra liveness can be tuned with `CASSANDRA_LIVENESS_CHECK` env. Provide `CASSANDRA_LIVENESS_CHECK` as `enabled` to enable the liveness check and provide `CASSANDRA_LIVENESS_CHECK` as `disabled` to skip the liveness check. The default value is disabled.
- The cassandra liveness image can be provided at `CASSANDRA_LIVENESS_IMAGE`.
- The cassandra liveness pod performs the CRUD operations to verify the liveness of cassandra. It creates the keyspace with `KEYSPACE_REPLICATION_FACTOR` keyspace factor.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/cassandra/cassandra-pod-delete/liveness-check.yaml yaml)
```yaml
## enable the cassandra liveness check, while injecting chaos
## it continuosly performs cassandra database operations(with cqlsh command) to vefify the liveness status
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "cassandra"
    applabel: "app=cassandra"
    appkind: "statefulset"
  chaosServiceAccount: casssandra-pod-delete-sa
  experiments:
  - name: casssandra-pod-delete
    spec:
      components:
        env:
        # checks the liveness of cassandra while injecting chaos
        # supports: enabled, disabled. default: disabled
        - name: CASSANDRA_LIVENESS_CHECK
          value: 'enabled'
        # image of the cassandra liveness deployment
        - name: CASSANDRA_LIVENESS_IMAGE
          value: 'litmuschaos/cassandra-client:latest'
        # keyspace replication factor, needed for liveness check
        - name: KEYSPACE_REPLICATION_FACTOR
          value: '3'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Multiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/cassandra/cassandra-pod-delete/chaos-interval.yaml yaml)
```yaml
# defines delay between each successive iteration of the chaos
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "cassandra"
    applabel: "app=cassandra"
    appkind: "statefulset"
  chaosServiceAccount: casssandra-pod-delete-sa
  experiments:
  - name: casssandra-pod-delete
    spec:
      components:
        env:
        # delay between each iteration of chaos
        - name: CHAOS_INTERVAL
          value: '15'
        # time duration for the chaos execution
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
