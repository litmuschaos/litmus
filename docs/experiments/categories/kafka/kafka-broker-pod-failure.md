## Kafka Broker Pod Failure

It deletes the Kafka pods with matching namespace, labels, and kind provided at `spec.appinfo` in chaosengine for the `TOTAL_CHAOS_DURATION` duration. 

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
<references to the sample manifest>

### Liveness check of kafka

- The kafka liveness can be tuned with `KAFKA_LIVENESS_STREAM` env. Provide `KAFKA_LIVENESS_STREAM` as `enable` to enable the liveness check and provide `KAFKA_LIVENESS_STREAM` as `disable` to skip the liveness check. The default value is `disable`.
- The Kafka liveness image can be provided at `KAFKA_LIVENESS_IMAGE`.
- The kafka liveness pod contains producer and consumer to validate the message stream during the chaos. The timeout for the consumer can be tuned with `KAFKA_CONSUMER_TIMEOUT`.

Use the following example to tune this:
<references to the sample manifest>

### Mutiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:
<references to the sample manifest>
