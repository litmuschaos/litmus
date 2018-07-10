## Checking MySQL data persistence upon forced reschedule (eviction) 

### Objective  

- This test checks MySQL data persistence with a specified storage solution by verifying table content post a forced
reschedule operation caused by immediate eviction effected by the Kubernetes node-controller manager. 

### Considerations

- This test simulates one type of graceful node loss (other means include cordon+drain operations) 
- The application reschedule time is also impacted by the amount of delay between disk attach and mount attempts by Kubernetes

### Steps to Run

- Apply the litmus/hack/rbac.yaml to setup the Litmus namespace, service account, clusterrole and clusterrolebinding 
- Create a configmap with content of kubernetes config file (needs to be named "admin.conf") 
- Run the litmus test job 
- View the test run & pod logs on the litmus node at /mnt


