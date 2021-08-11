## Introduction

- It causes (forced/graceful) pod failure of specific/random Kafka broker pods
- It tests deployment sanity (replica availability & uninterrupted service) and recovery workflows of the Kafka cluster
- It tests unbroken message stream when KAFKA_LIVENESS_STREAM experiment environment variable is set to enabled

!!! tip "Scenario: Deletes kafka broker pod"    
    ![Kafka Broker Pod Delete](../../images/kafka-pod-delete.png)

## Uses

??? info "View the uses of the experiment" 
    coming soon

## Prerequisites


??? info "Verify the prerequisites" 
    - Ensure that Kubernetes Version > 1.16 
    -  Ensure that the Litmus Chaos Operator is running by executing <code>kubectl get pods</code> in operator namespace (typically, <code>litmus</code>).If not, install from <a herf="https://docs.litmuschaos.io/docs/getstarted/#install-litmus">here</a>
    -  Ensure that the <code> kafka-broker-pod-failure </code> experiment resource is available in the cluster by executing <code>kubectl get chaosexperiments</code> in the desired namespace. If not, install from <a herf="https://hub.litmuschaos.io/api/chaos/master?file=charts/kafka/kafka-broker-pod-failure/experiment.yaml">here</a>
    - Ensure that Kafka & Zookeeper are deployed as Statefulsets
    - If Confluent/Kudo Operators have been used to deploy Kafka, note the instance name, which will be 
      used as the value of `KAFKA_INSTANCE_NAME` experiment environment variable 
        - In case of Confluent, specified by the `--name` flag
        - In case of Kudo, specified by the `--instance` flag
      Zookeeper uses this to construct a path in which kafka cluster data is stored. 

## Default Validations

??? info "View the default validations" 
    - Kafka Cluster (comprising the Kafka-broker & Zookeeper Statefulsets) is healthy
    - Kafka Message stream (if enabled) is unbroken

## Minimal RBAC configuration example (optional)

??? note "View the Minimal RBAC permissions"

    [embedmd]:# (https://raw.githubusercontent.com/litmuschaos/chaos-charts/master/charts/kafka/kafka-broker-pod-failure/rbac.yaml yaml)
    ```yaml
    ---
    apiVersion: v1
    kind: ServiceAccount
    metadata:
      name: kafka-broker-pod-failure-sa
      namespace: default
      labels:
        name: kafka-broker-pod-failure-sa
        app.kubernetes.io/part-of: litmus
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: ClusterRole
    metadata:
      name: kafka-broker-pod-failure-sa
      labels:
        name: kafka-broker-pod-failure-sa
        app.kubernetes.io/part-of: litmus
    rules:
    - apiGroups: [""]
      resources: ["pods","events"]
      verbs: ["create","list","get","patch","update","delete","deletecollection"]
    - apiGroups: [""]
      resources: ["pods/exec","pods/log"]
      verbs: ["create","list","get"]
    - apiGroups: ["batch"]
      resources: ["jobs"]
      verbs: ["create","list","get","delete","deletecollection"]
    - apiGroups: ["apps"]
      resources: ["deployments","statefulsets"]
      verbs: ["list","get"]
    - apiGroups: ["litmuschaos.io"]
      resources: ["chaosengines","chaosexperiments","chaosresults"]
      verbs: ["create","list","get","patch","update"]
    - apiGroups: [""]
      resources: ["nodes"]
      verbs: ["get","list"]
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: ClusterRoleBinding
    metadata:
      name: kafka-broker-pod-failure-sa
      labels:
        name: kafka-broker-pod-failure-sa
        app.kubernetes.io/part-of: litmus
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: ClusterRole
      name: kafka-broker-pod-failure-sa
    subjects:
    - kind: ServiceAccount
      name: kafka-broker-pod-failure-sa
      namespace: default
    ```
    Use this sample RBAC manifest to create a chaosServiceAccount in the desired (app) namespace. This example consists of the minimum necessary role permissions to execute the experiment.

## Experiment tunables

??? info "check the experiment tunables"
    <h2>Mandatory Fields</h2>

    <table>
      <tr>
        <th> Variables </th>
        <th> Description </th>
        <th> Notes </th>
      </tr>
      <tr>
        <td> KAFKA_NAMESPACE </td>
        <td> Namespace of Kafka Brokers </td>
        <td> May be same as value for <code>spec.appinfo.appns</code> </td>
      </tr>
      <tr>
        <td> KAFKA_LABEL </td>
        <td> Unique label of Kafka Brokers </td>
        <td> May be same as value for <code>spec.appinfo.applabel</code> </td>
      </tr>
      <tr>
        <td> KAFKA_SERVICE </td>
        <td> Headless service of the Kafka Statefulset </td>
        <td>  </td>
      </tr>
      <tr>
        <td> KAFKA_PORT </td>
        <td> Port of the Kafka ClusterIP service </td>
        <td>  </td>
      </tr>
      <tr>
        <td> ZOOKEEPER_NAMESPACE </td>
        <td> Namespace of Zookeeper Cluster </td>
        <td> May be same as value for KAFKA_NAMESPACE or other </td>
      </tr>
      <tr>
        <td> ZOOKEEPER_LABEL </td>
        <td> Unique label of Zokeeper statefulset </td>
        <td>  </td>
      </tr>
      <tr>
        <td> ZOOKEEPER_SERVICE </td>
        <td> Headless service of the Zookeeper Statefulset </td>
        <td>  </td>
      </tr>
      <tr>
        <td> ZOOKEEPER_PORT </td>
        <td> Port of the Zookeeper ClusterIP service </td>
        <td>  </td>
      </tr>
    </table>

    <h2>Optional Fields</h2>

    <table>
      <tr>
        <th> Variables </th>
        <th> Description </th>
        <th> Notes </th>
      </tr>
      <tr>
        <td> KAFKA_BROKER </td>
        <td> Kafka broker pod (name) to be deleted </td>
        <td> A target selection mode (random/liveness-based/specific) </td>
      </tr>
      <tr>
        <td> KAFKA_KIND </td>
        <td> Kafka deployment type </td>
        <td> Same as <code>spec.appinfo.appkind</code>. Supported: <code>statefulset</code> </td>
      </tr>
      <tr>
        <td> KAFKA_LIVENESS_STREAM </td>
        <td> Kafka liveness message stream </td>
        <td> Supported: <code>enabled</code>, <code>disabled</code> </td>
      </tr>
      <tr>
        <td> KAFKA_LIVENESS_IMAGE </td>
        <td> Image used for liveness message stream </td>
        <td> Set the liveness image as &lt;registry_url&gt;/&lt;repository&gt;:&lt;image-tag&gt; </td>
      </tr>
      <tr>
        <td> KAFKA_REPLICATION_FACTOR </td>
        <td> Number of partition replicas for liveness topic partition </td>
        <td> Necessary if KAFKA_LIVENESS_STREAM is  <code>enabled</code>. The replication factor should be less than or equal to number of Kafka brokers </td>
      </tr>
      <tr>
        <td> KAFKA_INSTANCE_NAME </td>
        <td> Name of the Kafka chroot path on zookeeper </td>
        <td> Necessary if installation involves use of such path </td>
      </tr>
      <tr>
        <td> KAFKA_CONSUMER_TIMEOUT </td>
        <td> Kafka consumer message timeout, post which it terminates </td>
        <td> Defaults to 30000ms, Recommended timeout for EKS platform: 60000 ms </td>
      </tr>
      <tr>
        <td> TOTAL_CHAOS_DURATION </td>
        <td> The time duration for chaos insertion (seconds) </td>
        <td> Defaults to 15s </td>
      </tr>
      <tr>
        <td> CHAOS_INTERVAL </td>
        <td> Time interval b/w two successive broker failures (sec) </td>
        <td> Defaults to 5s </td>
      </tr>
    </table>

## Experiment Examples

### Common Experiment Tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) to tune the common tunables for all the experiments.

### Kafka And Zookeeper App Details

It contains kafka and zookeeper application details:

- `KAFKA_NAMESPACE`: Namespace where kafka is installed
- `KAFKA_LABEL`: Labels of the kafka application
- `KAFKA_SERVICE`: Name of the kafka service
- `KAFKA_PORT`: Port of the kafka service
- `ZOOKEEPER_NAMESPACE`: Namespace where zookeeper is installed
- `ZOOKEEPER_LABEL`: Labels of the zookeeper application
- `ZOOKEEPER_SERVICE`: Name of the zookeeper service
- `ZOOKEEPER_PORT`: Port of the zookeeper service
- `KAFKA_BROKER`: Name of the kafka broker pod
- `KAFKA_REPLICATION_FACTOR`: Replication factor of the kafka application

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/kafka/kafka-broker-pod-failure/kafka-and-zookeeper-details.yaml yaml)
```yaml
## details of the kafka and zookeeper
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "kafka"
    applabel: "app=cp-kafka"
    appkind: "statefulset"
  chaosServiceAccount: kafka-broker-pod-failure-sa
  experiments:
  - name: kafka-broker-pod-failure
    spec:
      components:
        env:
        # namespace where kafka installed
        - name: KAFKA_NAMESPACE
          value: 'kafka'
        # labels of the kafka
        - name: KAFKA_LABEL
          value: 'app=cp-kafka'
        # name of the kafka service
        - name: KAFKA_SERVICE
          value: 'kafka-cp-kafka-headless'
        # kafka port number
        - name: KAFKA_PORT
          value: '9092'
        # namespace of the zookeeper
        - name: ZOOKEEPER_NAMESPACE
          value: 'default'
        # labels of the zookeeper
        - name: ZOOKEEPER_LABEL
          value: 'app=cp-zookeeper'
        # name of the zookeeper service
        - name: ZOOKEEPER_SERVICE
          value: 'kafka-cp-zookeeper-headless'
        # port of the zookeeper service
        - name: ZOOKEEPER_PORT
          value: '2181'
        # name of the kafka broker
        - name: KAFKA_BROKER
          value: 'kafka-0'
        # kafka replication factor
        - name: KAFKA_REPLICATION_FACTOR
          value: '3'
        # duration of the chaos
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Liveness check of kafka

- The kafka liveness can be tuned with `KAFKA_LIVENESS_STREAM` env. Provide `KAFKA_LIVENESS_STREAM` as `enable` to enable the liveness check and provide `KAFKA_LIVENESS_STREAM` as `disable` to skip the liveness check. The default value is `disable`.
- The Kafka liveness image can be provided at `KAFKA_LIVENESS_IMAGE`.
- The kafka liveness pod contains producer and consumer to validate the message stream during the chaos. The timeout for the consumer can be tuned with `KAFKA_CONSUMER_TIMEOUT`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/kafka/kafka-broker-pod-failure/kafka-liveness.yaml yaml)
```yaml
## checks the kafka message liveness while injecting chaos
## sets the consumer timeout
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "kafka"
    applabel: "app=cp-kafka"
    appkind: "statefulset"
  chaosServiceAccount: kafka-broker-pod-failure-sa
  experiments:
  - name: kafka-broker-pod-failure
    spec:
      components:
        env:
        # check for the kafa liveness message stream during chaos
        # supports: enable, disable. default value: disable
        - name: KAFKA_LIVENESS_STREAM
          value: 'enable'
        # timeout of the kafka consumer
        - name: KAFKA_CONSUMER_TIMEOUT
          value: '30000' # in ms
        # image of the kafka liveness pod
        - name: KAFKA_LIVENESS_IMAGE
          value: ''
        - name: KAFKA_NAMESPACE
          value: 'kafka'
        - name: KAFKA_LABEL
          value: 'app=cp-kafka'
        - name: KAFKA_SERVICE
          value: 'kafka-cp-kafka-headless'
        - name: KAFKA_PORT
          value: '9092'
        - name: ZOOKEEPER_NAMESPACE
          value: 'default'
        - name: ZOOKEEPER_LABEL
          value: 'app=cp-zookeeper'
        - name: ZOOKEEPER_SERVICE
          value: 'kafka-cp-zookeeper-headless'
        - name: ZOOKEEPER_PORT
          value: '2181'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Mutiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/categories/kafka/kafka-broker-pod-failure/chaos-interval.yaml yaml)
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
    appns: "kafka"
    applabel: "app=cp-kafka"
    appkind: "statefulset"
  chaosServiceAccount: kafka-broker-pod-failure-sa
  experiments:
  - name: kafka-broker-pod-failure
    spec:
      components:
        env:
         # delay between each iteration of chaos
        - name: CHAOS_INTERVAL
          value: '15'
        # time duration for the chaos execution
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
        - name: KAFKA_NAMESPACE
          value: 'kafka'
        - name: KAFKA_LABEL
          value: 'app=cp-kafka'
        - name: KAFKA_SERVICE
          value: 'kafka-cp-kafka-headless'
        - name: KAFKA_PORT
          value: '9092'
        - name: ZOOKEEPER_NAMESPACE
          value: 'default'
        - name: ZOOKEEPER_LABEL
          value: 'app=cp-zookeeper'
        - name: ZOOKEEPER_SERVICE
          value: 'kafka-cp-zookeeper-headless'
        - name: ZOOKEEPER_PORT
          value: '2181'
```
