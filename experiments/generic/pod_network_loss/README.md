## Experiment Metadata

| Type  | Description                                                  | K8s Platform |
| ----- | ------------------------------------------------------------ | -------------|
| Chaos | Inject packet loss into application pod                      | Any          |

## Entry-Criteria

- Application pods are healthy before chaos injection

## Exit-Criteria

- Application pods are healthy post chaos injection

## Pre-Requisites

- Application subjected to chaos must have `tc` network traffic shaping tool installed

## Notes

- Typically used as a disruptive test, to cause loss of access to application replica by injecting packet loss using pumba.
- The application pod should be healthy once chaos is stopped. Service-requests should be served (say, via alternate replicas) despite chaos.

## Associated Chaos Utils

- [pumba/network_chaos/network_chaos.yml](/chaoslib/pumba/network_chaos/network_chaos.yml) 
- [pumba/network_chaos/induce_packet_loss.yml](/chaoslib/pumba/network_chaos/induce_packet_loss.yml)

## Litmusbook Environment Variables

### Application

| Parameter     | Description                                                  |TYPE|
| ------------- | ------------------------------------------------------------ |-----
| APP_NAMESPACE | Namespace in which application pods are deployed             |Mandatory
| APP_LABEL     | Unique Labels in `key=value` format of application deployment |Mandatory
| TARGET_CONTAINER | Name of container which is subjected to network latency   |Mandatory
| NETWORK_INTERFACE | Name of ethernet interface considered for shaping traffic|Mandatory

### Chaos 

| Parameter      | Description                           |TYPE|
| -------------- | ------------------------------------- |----
| NETWORK_PACKET_LOSS_PERCENTAGE  | The packet loss in percentage   |Mandatory
| CHAOS_DURATION | The time duration for chaos injection |Mandatory
| LIB            | The chaos tool used to inject the chaos | Mandatory
| CHAOSENGINE    | ChaosEngine CR name associated with the experiment instance |Optional
| CHAOS_SERVICE_ACCOUNT | Service account used by the pumba daemonset| Optional



### Procedure

- Identify the values for the mandatory ENV variables
- Create the chaos job via `kubectl create -f pod_network_loss_k8s_job.yml` 
- Check result of the experiment via `kubectl describe chaosresult pod-network-loss` (prefix chaosengine name to experiment name if applicable)
- View experiment logs  via `kubectl logs -f <chaos-pod-name>` 
