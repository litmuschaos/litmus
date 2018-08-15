# OpenEBS v0.7 storageclass job

This litmus job installs openebs storage pool or storage pool claim and openebs storage class for openebs jiva or cstor v0.7. By default this job creates a storage pool with name *openebs-mntdir* and storage class with name *openebs-storageclass* and uses the following yaml jinja template.

cstore storageclass template
```
---
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: {{ lookup('env','CSTOR_POOL_NAME') }}
  annotations:
    cas.openebs.io/create-pool-template: cstor-pool-create-default-0.7.0
    cas.openebs.io/delete-pool-template: cstor-pool-delete-default-0.7.0
spec:
  name: {{ lookup('env','CSTOR_POOL_NAME') }}
  type: openebs-cstor
  maxPools: {{ lookup('env','MAX_POOLS') }}
  poolSpec:
    poolType: striped
    cacheFile: /tmp/pool1.cache
    overProvisioning: false
  # NOTE - Appropriate disks need to be fetched using `kubectl get disks`
  #
  # `Disk` is a custom resource supported by OpenEBS with `node-disk-manager` 
  # as the disk operator
  disks:
    diskList:
# Replace the following with actual disk CRs from your cluster `kubectl get disks`
#      - disk-0c84c169ab2f398b92914f56dad41f81
#      - disk-66a74896b61c60dcdaf7c7a76fde0ebb
#      - disk-b34b3f97840872da9aa0bac1edc9578a
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: {{ lookup('env','CSTOR_STORAGECLASS_NAME') }}
  annotations:
    cas.openebs.io/create-volume-template: cstor-volume-create-default-0.7.0
    cas.openebs.io/delete-volume-template: cstor-volume-delete-default-0.7.0
    cas.openebs.io/read-volume-template: cstor-volume-read-default-0.7.0
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "{{ lookup('env','CSTOR_POOL_NAME') }}"
provisioner: openebs.io/provisioner-iscsi
---
```

jiva storageclass template
```
---
apiVersion: openebs.io/v1alpha1
kind: StoragePool
metadata:
  name: {{ lookup('env','JIVA_POOL_NAME') }}
  type: hostdir
spec:
  path: "{{ lookup('env','STORAGE_PATH') }}"
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: {{ lookup('env','JIVA_STORAGECLASS_NAME') }}
  annotations:
    cas.openebs.io/create-volume-template: jiva-volume-create-default-0.7.0
    cas.openebs.io/delete-volume-template: jiva-volume-delete-default-0.7.0
    cas.openebs.io/read-volume-template: jiva-volume-read-default-0.7.0
    cas.openebs.io/config: |
      - name: ControllerImage
        value: {{ lookup('env','OPENEBS_IO_JIVA_CONTROLLER_IMAGE') }}
      - name: ReplicaImage
        value: {{ lookup('env','OPENEBS_IO_JIVA_REPLICA_IMAGE') }}
      - name: VolumeMonitorImage
        value: {{ lookup('env','OPENEBS_IO_VOLUME_MONITOR_IMAGE') }}
      - name: ReplicaCount
        value: "{{ lookup('env','OPENEBS_IO_JIVA_REPLICA_COUNT') }}"
      - name: StoragePool
        value: {{ lookup('env','JIVA_POOL_NAME') }}
provisioner: openebs.io/provisioner-iscsi
---
```
### Prerequisites

-> The cluster should be litmus enabled.  
-> Openebs v0.6 operator must be installed.  

### Installing

-> Starting storageclass_setup job :```kubectl apply -f litmusbook/storageclass_setup.yaml```.  
-> Deleting storageclass_setup job :```kubectl delete -f litmusbook/storageclass_setup.yaml```.  
-> Starting storageclass_cleanup job :```kubectl apply -f litmusbook/storageclass_cleanup.yaml```.  
-> Deleting storageclass_cleanup job :```kubectl apply -f litmusbook/storageclass_cleanup.yaml```.  

### Note:

-> Disk List UUID can be provided through DISK_LIST env variable in csv format.  
-> Some storage class and storage pool artifacts can be passed explicitly by changing the environment variables.

Example:

```
---
apiVersion: batch/v1
kind: Job
metadata:
  name: litmus-storageclass-setup-v0.7
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
          # Enable storageclass
          - name: APPLY_JIVA
            value: "true"
          - name: APPLY_CSTOR
            value: "false"
          # Jiva configuration
          - name: JIVA_POOL_NAME
            value: openebs-mntdir
          - name: JIVA_STORAGECLASS_NAME
            value: openebs-storageclass
          - name: STORAGE_PATH
            value: /var/openebs
          - name: OPENEBS_IO_JIVA_REPLICA_COUNT
            value: "3"
          - name: OPENEBS_IO_JIVA_CONTROLLER_IMAGE
            value: openebs/jiva:0.6.0
          - name: OPENEBS_IO_JIVA_REPLICA_IMAGE
            value: openebs/jiva:0.6.0
          - name: OPENEBS_IO_VOLUME_MONITOR_IMAGE
            value: openebs/m-exporter:ci
          # Cstor configuration
          - name: CSTOR_POOL_NAME
            value: cstor-pool-default-0.7.0
          - name: MAX_POOLS
            value: "3"
          - name: CSTOR_STORAGECLASS_NAME
            value: openebs-cstor-default-0.7.0
          - name: DISK_LIST
            value: disk-1c05ac3ef8d84d34c9a7608b7dfe8eac,disk-3a2506752143dabf5e222ae46e6e40ab,disk-934bdf4927cb05b1129f9e7a8fb59c87
        command: ["/bin/bash"]
        args: ["-c", "ansible-playbook ./storageclass/0.7/ansible/storageclass_setup.yaml -i /etc/ansible/hosts -vv; exit 0"]

```


#### Environment variables that can be used for passing storage pool, claim and storage class artifacts  

# Enable/Disable storageclass
-> APPLY_JIVA 
-> APPLY_CSTOR 
-> DELETE_JIVA  
-> DELETE_CSTOR  
# Jiva configuration  
-> JIVA_POOL_NAME  
-> JIVA_STORAGECLASS_NAME  
-> STORAGE_PATH  
-> OPENEBS_IO_JIVA_REPLICA_COUNT  
-> OPENEBS_IO_JIVA_CONTROLLER_IMAGE  
-> OPENEBS_IO_JIVA_REPLICA_IMAGE  
-> OPENEBS_IO_VOLUME_MONITOR_IMAGE  
# Cstor configuration  
-> CSTOR_POOL_NAME  
-> MAX_POOLS  
-> CSTOR_STORAGECLASS_NAME  
-> DISK_LIST  
