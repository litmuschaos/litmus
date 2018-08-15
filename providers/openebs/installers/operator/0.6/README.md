# OpenEBS v0.6 litmus job

This litmus job installs OpenEBS v0.6 on a litmus enabled cluster. This job first downloads the openebs-operator.yaml from the following link ```https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-operator.yaml``` and then scans the environment variables for explicitly passed image names. If any explicitly passed image name is found then it replaces the images present in operator yaml by explicitly passed image name. After replacing the image names it applies the operator and waits till all the pods to get into running state before exiting. 

### Prerequisites

-> The cluster should be litmus enabled.  
-> Admin context should be available. 

### Installing

-> Starting the openebs setup job :```kubectl apply -f litmusbook/openebs_setup.yaml```.
-> Deleting the setup job :```kubectl delete -f litmusbook/setup_setup.yaml```.
-> Starting the openebs cleanup job :```kubectl apply -f litmusbook/openebs_cleanup.yaml```.
-> Deleting the openebs cleanup job :```kubectl delete -f litmusbook/openebs_cleanup.yaml```.

### Note:

Image names for openebs-operator can be explicitly passed by environment variable in the setup_openebs.yaml.

Example:
```
---
apiVersion: batch/v1
kind: Job
metadata:
  name: litmus-openebs-setup
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
            value: * Enter the image name here *
          - name: OPENEBS_PROVISIONER_IMAGE
            value: * Enter the image name here *
          - name: OPENEBS_SNAPSHOT_CONTROLLER_IMAGE
            value: * Enter the image name here *
          - name: OPENEBS_SNAPSHOT_PROVISIONER_IMAGE
            value: * Enter the image name here *
          - name: OPENEBS_IO_JIVA_CONTROLLER_IMAGE
            value: * Enter the image name here *
          - name: OPENEBS_IO_JIVA_REPLICA_IMAGE
            value: * Enter the image name here *
          - name: OPENEBS_IO_VOLUME_MONITOR_IMAGE
            value: * Enter the image name here *
          - name: OPENEBS_IO_JIVA_REPLICA_COUNT
            value: * Enter the image name here *
        command: ["/bin/bash"]
        args: ["-c", "ansible-playbook ./operator/0.6/cleanup/ansible/openebs_cleanup.yaml -i /etc/ansible/hosts -vvv; exit 0"]
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
-> OPENEBS_IO_JIVA_CONTROLLER_IMAGE  
-> OPENEBS_IO_JIVA_REPLICA_IMAGE  
-> OPENEBS_IO_VOLUME_MONITOR_IMAGE  
-> OPENEBS_IO_JIVA_REPLICA_COUNT    
