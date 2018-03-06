### Introduction to Logger

- The logger container and debugjob K8s job have been created to aid troubleshoot/debugging on 
  the kubernetes cluster by capturing the pod logs 
- Logger uses a tool called "stern" to collect the pod logs.
- It is also capable of executing kubectl commands to extract cluster state.

### Steps to run the OpenEBS Logger kubernetes job (debugjob)

- Identify the path to the kubeconfig file & create a config map with its content. This is
  required to be passed to the stern binary in order to collect the pod logs. Typically, the 
  kubeconfig file is available at /etc/kubernetes/admin.conf OR ~/.kube/config. It may also
  be obtained from the ENV on the master/deployment node.

  `kubectl create configmap kubeconfig --from-file=<path-to-kubeconfig-file>`

- In the command to be executed, edit the logging duration & pod regex to reflect which pods' 
  logs should be captured and for how long.

  `./logger.sh -d 5 -r maya,openebs,pvc;` 

  In the example above, the logs for pods starting with literals "maya", "openebs" and "pvc" are 
  captured for a period of 5 min. 

  Note: The duration is arrived upon depending on the average time taken for the "issue/bug" to
  manifest from the time of pod start. 

- Create the kubernetes job to run logger using the command `kubectl apply -f debugjob.yaml` 

- This job will run for the duration specified in the previous steps

- The logs collected in the manner described above are placed in a logbundle (tarball) in 
  "/mnt" directory of the node in which the debug pod was scheduled

- The node in which the debug pod/logger is scheduled & logs are available can be obtained by 
  performing a `kubectl get pod -o wide` command. 

- Attach this log support bundle while raising issues on the OpenEBS repository


