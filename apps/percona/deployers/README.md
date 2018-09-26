#Running percona pod
This tutorial provides detailed instructions on how to run percona application using litmus book.

### Pre-requisites
Users have a Kubernetes environment with a given stateful workload and underlying storage and would like to test a specific scenarion:

- Ensure that the desired storage operators are actually available on a given Kubernetes cluster.
- Setup the dedicated RBAC for a litmus. 
- Create a configmap from the cluster's in-cluster-config (kubeconfig) file with the data placed in "admin.conf". 
   To see how to set RBAC and create of configmap follow the below link `https://github.com/openebs/litmus#pre-requisites-for-running-a-specific-test`

## Deploy Percona using Litmus
 The files structure in this deployer is as follows:

```
devops@cloudshell:~/litmus/apps/percona/deployers$ ls -ltr
total 20
-rw-r--r-- 1 devops devops 3100 Sep 25 14:14 test.yml
-rw-r--r-- 1 devops devops  867 Sep 25 14:14 run_litmus_test.yml
-rw-r--r-- 1 devops devops 1231 Sep 25 14:14 percona.yml
-rw-r--r-- 1 devops devops  107 Sep 25 14:14 test_vars.yml
-rw-r--r-- 1 devops devops  178 Sep 26 10:47 README.md
```

**test.yml** is the ansible playbook to deploy percona application and update the result CR.

**test_vars.yml** contain the variables used in ansible playbook.

**percona.yml** is the application deployment spec file.

**run_litmus_test.yml** is the litmus job file that creates test pod which in turn deploys the application. The variables used in the playbook can be passed as environmental variables under container.

 - To perform this test, Modify the PROVIDER_STORAGE_CLASS in run_litmus_test.yml and apply the yml file.

**Note**: To run the test, please ensure *kubectl create* is used as against *kubectl apply* as the test job uses the `generateName` API to autogenerate the
  job name. This is to ensure a re-run of the job w/o deleting the previous instance doesn't throw an error.

Create the litmus job by running the following command. 

```
devops@cloudshell:~/litmus/apps/percona/deployers$ kubectl create -f run_litmus_test.yml
job.batch "litmus-percona" created
```
Verify the litmus job is created and completed successfully

```
devops@cloudshell:~/litmus/apps/percona/deployers $ kubectl get pods -n litmus
NAME                                                         READY     STATUS      RESTARTS   AGE
litmus-percona-74xk5                                         0/1       Completed   0          7m
```

Also verify the application pod is running succesfully

```
devops@cloudshell:~/litmus/apps/percona/deployers $ kubectl get pods -n percona
NAME                                                         READY     STATUS      RESTARTS   AGE
percona-percona-mysql-claim-837890524-ctrl-8447fc5d57-9rlkh   2/2       Running     0          7m
percona-percona-mysql-claim-837890524-rep-ff9df6747-4t5dp     1/1       Running     0          7m
percona-percona-mysql-claim-837890524-rep-ff9df6747-dks4t     1/1       Running     0          7m
percona-percona-mysql-claim-837890524-rep-ff9df6747-whwv2     1/1       Running     0          7m
percona-786c6b7c7f-njz9h                                      1/1       Running     0          7m
```

To see the litmus result(lr) do the following step,

```
devops@cloudshell:~/litmus/apps/percona/deployers $ kubectl get lr
NAME                 AGE
percona-deployment   25m
```
Describe the lr pod to see the status and result of the litmus job

```
kubectl describe lr <lr-name>
```
