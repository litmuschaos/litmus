# Litmus Executer
 Litmus executor runs the litmusbook sequentially as order is defined in all.csv file.
**In order to run executer perform the following steps:**
- Update the **all.csv** present in ```/executer/ansible/``` in this manner: **[test-type]:[test-path]:[litmus-job-label]**
**Example:**
```
deployers:/apps/percona/deployers/run_litmus_test.yml:percona-deployment-litmus
loadgen:/apps/percona/workload/run_litmus_test.yml:percona-loadgen-litmus
chaos:apps/percona/chaos/openebs_replica_network_delay:openebs-replica-network-delay-litmus
```
- Then simply run the bash file **execute.sh** present in ```/executer/ansible/```. 
**Example:** 
```bash execute.sh```

# NOTE
**Following things should be considered before running the executer:**
1. No spaces are allowed in all.csv file.
2. The label for litmus job should be like:**[test-name]-litmus**.
