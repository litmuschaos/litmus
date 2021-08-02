It deletes the Kafka pods with matching namespace, labels, and kind provided at `spec.appinfo` in chaosengine for the `TOTAL_CHAOS_DURATION` duration. 

### Common Experiment Tunables

Refer the [common attributes](../common/common.md) to tune the common tunables for all the experiments.

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
