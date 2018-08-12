# OpenEBS v0.6 litmus job

This litmus job installs OpenEBS v0.6 on a litmus enabled cluster. This job first downloads the openebs-operator.yaml from the following link ```https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-operator.yaml``` and then scans the environment variables for explicitly passed image names. If any explicitly passed image name is found then it replaces the images present in operator yaml by explicitly passed image name. After replacing the image names it applies the operator and waits till all the pods to get into running state before exiting. 

### Prerequisites

-> The cluster should be litmus enabled.  
-> Admin context should be available. 

### Installing

This job can be easily started by just applying ```kubectl apply -f litmusbook/setup_openebs.yaml```.

### Note:

Image names for openebs-operator can be explicitly passed by environment variable in the setup_openebs.yaml .
Example:
```
---
apiVersion: batch/v1
kind: Job
metadata:
  name: litmus-openebs
  namespace: litmus 
spec:
  template:
    metadata:
      name: litmus
    spec:
      serviceAccountName: litmus
      restartPolicy: Never
      containers:
      - name: ansibletest
        image: openebs/ansible-runner:ci
        imagePullPolicy: Always
        env: 
          - name: mountPath
            value: /mnt/openebs
          - name: ANSIBLE_STDOUT_CALLBACK
            value: actionable
          - name: MAYA_APISERVER_IMAGE
            value: * image name *
        command: ["/bin/bash"]
        args: ["-c", "ansible-playbook ./operator/0.6/ansible/openebs.yaml -i /etc/ansible/hosts -vvv; exit 0"]
        volumeMounts:
          - name: kubeconfig 
            mountPath: /root/admin.conf
            subPath: admin.conf
          - name: logs
            mountPath: /var/log/ansible 
      volumes: 
        - name: kubeconfig
          configMap: 
            name: kubeconfig 
        - name: logs 
          hostPath:
            path: /mnt/openebs
            type: ""

```


#### Environment variables that can be used for passing image name to the job
-> MAYA_APISERVER_IMAGE  
-> OPENEBS_PROVISIONER_IMAGE  
-> OPENEBS_SNAPSHOT_CONTROLLER_IMAGE  
-> OPENEBS_SNAPSHOT_PROVISIONER_IMAGE  
