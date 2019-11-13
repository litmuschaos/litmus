### Sanple ChaosEngine manifest to execute kafka broker kill experiment

    ```
    apiVersion: litmuschaos.io/v1alpha1
    kind: ChaosEngine
    metadata:
      name: engine-nginx
      namespace: default
    spec:
      appinfo: 
        appns: default
        applabel: ''
        appkind: statefulset
      chaosServiceAccount: default
      monitoring: true
      experiments:
        - name: kafka-broker-pod-failure
          spec:
          components:             <--- ADD ALL ENV VARIABLES HERE - WHICH NEEDS TO BE OVERRIDDEN
            - name: KAFKA_NAMESPACE
              value: ''

            - name: KAFKA_LABEL
              value: ''

            - name: KAFKA_BROKER
              value: ''

            - name: KAFKA_REPLICATION_FACTOR
              value: ''

            - name: KAFKA_SERVICE
              value: ''

            - name: KAFKA_PORT
              value: ''

            - name: ZOOKEEPER_NAMESPACE
              value: ''

            - name: ZOOKEEPER_LABEL
              value: ''

            - name: ZOOKEEPER_SERVICE
              value: ''

            - name: ZOOKEEPER_PORT
              value: ''
    ```