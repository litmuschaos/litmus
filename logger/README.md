## OpenEBS Logger FAQ

### What is OpenEBS Logger   

- The logger is an Kubernetes job which can be run on the cluster to extract pod logs and 
  cluster info. It has been created to aid troubleshoot/debugging activities.

- It runs the logger container *openebs/logger*

- Recommended to run for a specifc duration to capture logs on issue reproduction attempts 

### Why use logger 

- Logger serves a purpose to obtain debug-info/quick logs in clusters where more standard
  logging frameworks like EFK are not already configured. Logger creates a simple support bundle 
  which can be provided to debug teams.

- This may be the case with most "non-production/dev" infrastructures

### How does the Logger work

- Logger uses a tool called "stern" to collect the pod logs.

- It uses kubectl commands to extract cluster info.

### What are the pre-requisites to run Logger 

- Logger needs the kubeconfig file mounted as a configmap (passed to stern binary) 
  Kubeconfig is generally found in /etc/kubernetes/admin.conf or ~/.kube/config

### How to run the Logger 

- In the logger job's command, edit the logging duration (-d) & pod regex (-r) to specify
  which pods' logs should be captured and for how long.

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


