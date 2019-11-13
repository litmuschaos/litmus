### Sample ChaosEngine manifest to execute kafka broker kill experiment

-   To override experiment defaults, add the ENV variables in `spec.components` of the experiment. 

    ```yml
    apiVersion: litmuschaos.io/v1alpha1
    kind: ChaosEngine
    metadata:
      name: kafka-chaos
      namespace: default
    spec:
      appinfo: 
        appns: default
        applabel: 'app=cp-kafka'
        appkind: statefulset
      chaosServiceAccount: kafka-sa
      monitoring: false
      experiments:
        - name: kafka-broker-pod-failure
          spec:
            components:  
              # choose based on available kafka broker replicas           
              - name: KAFKA_REPLICATION_FACTOR
                value: '3'

              # get via "kubectl get pods --show-labels -n <kafka-namespace>"
              - name: KAFKA_LABEL
                value: 'app=cp-kafka'

              - name: KAFKA_NAMESPACE
                value: 'default'
     
              # get via "kubectl get svc -n <kafka-namespace>" 
              - name: KAFKA_SERVICE
                value: 'kafka-cp-kafka-headless'

              # get via "kubectl get svc -n <kafka-namespace>  
              - name: KAFKA_PORT
                value: '9092'

              - name: ZOOKEEPER_NAMESPACE
                value: 'default'

              # get via "kubectl get pods --show-labels -n <zk-namespace>"
              - name: ZOOKEEPER_LABEL
                value: 'app=cp-zookeeper'

              # get via "kubectl get svc -n <zk-namespace>  
              - name: ZOOKEEPER_SERVICE
                value: 'kafka-cp-zookeeper-headless'

              # get via "kubectl get svc -n <zk-namespace>  
              - name: ZOOKEEPER_PORT
                value: '2181'
    ```