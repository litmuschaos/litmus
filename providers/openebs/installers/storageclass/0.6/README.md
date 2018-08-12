# OpenEBS v0.6 storageclass job

This litmus job installs openebs storage pool and openebs storage class for openebs v0.6. By default this job creates a storage pool with name *openebs-mntdir* and storage class with name *openebs-storageclass* and uses the following yaml.

*StorageClass.yaml*

```
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
   name: openebs-storageclass
provisioner: openebs.io/provisioner-iscsi
parameters:
  openebs.io/storage-pool: "openebs-mntdir"
  openebs.io/jiva-replica-count: "3"
  openebs.io/volume-monitor: "true"
  openebs.io/capacity: 5G
```

*StoragePool.yaml*

```
---
apiVersion: openebs.io/v1alpha1
kind: StoragePool
metadata:
    name: openebs-mntdir
    type: hostdir
spec:
    path: "/mnt/openebs"
```

### Prerequisites

-> The cluster should be litmus enabled.  

### Installing

This job can be easily started by just applying ```kubectl apply -f litmusbook/setup_storageclass.yaml```.

### Note:

Some storage class and storage pool artifacts can be passed explicitly as give below.

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
          - name: STORAGE_POOL_NAME
            value: *pool name*
        command: ["/bin/bash"]
        args: ["-c", "ansible-playbook ./storageclass/0.6/ansible/storageclass.yaml -i /etc/ansible/hosts -vvv; exit 0"]
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


#### Environment variables that can be used for passing storage pool and storage class artifacts
-> STORAGE_POOL_NAME  
-> STORAGE_PATH  
-> STORAGECLASS_NAME  
-> JIVA_REPLICA_COUNT  
-> CAPACITY
