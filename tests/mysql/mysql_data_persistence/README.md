## Checking MySQL data persistence upon forced reschedule (eviction) 

### Objective  

- This test checks MySQL data persistence with a specified storage solution after the application is subjected to
different types of failures, induced via "chaos" operations. Currently, the following chaos types are supported by the test job:

  - APP_POD_KILL/PUMBA : The MySQL pod is terminated abruptly (via SIGKILL) , multiple times, over a perdiod of 120s using Pumba
  - APP_POD_EVICT/KUBECTL : The MySQL and other pods on the application node are forcefully evicted by Kubernetes via resource taints
  - APP_NODE_DRAIN/KUBECTL : The application node is taken down gracefully via cordon & drain process

### Considerations

- This test requires a multi-node Kubernetes cluster 
  *Note:* The min. count depends on individual storage solution's HA policies. For example OpenEBS needs 3-node cluster
- This test simulates node loss, with original cluster state being reverted to at the end of test
- The application reschedule time is also impacted by the amount of delay between disk attach and mount attempts by Kubernetes

### Steps to Run

- Apply the litmus/hack/rbac.yaml to setup the Litmus namespace, service account, clusterrole and clusterrolebinding
- Create a configmap with content of kubernetes config file (needs to be named "admin.conf")
- Run the litmus test job after specifying the desired storage class and chaos type 
- View the following test info on the litmus node at /mnt/mysql_data_persistence : 
 
  - Pod logs at "Logstash_<timestamp>_.tar
  - Playbook run logs at "hosts/127.0.0.1" 
  - Result at "result.json"


