# AWS platform specific code and scripts
## Amazon web service and Attiching EBS Volume in Provided Kubernetes cluster

### Prerequistes

- AWS Cluster is up and running
- Disable ansible host key checking `export ANSIBLE_HOST_KEY_CHECKING=False`

### Creating, attach and mount EBS Volume in AWS Cluster

- Run `create-ebs-volume`, will create, attach and mount EBS volume to each node of provided cluster name.

```bash
ansible-playbook create-ebs-volume.yml -vv --extra-vars "cluster_name=<aws-cluster-name>"
```

### Unmount, Detach and delete EBS Volume in AWS cluster

- Run `delete-ebs-volume`, will unmount, detach and delete EBS volume from the provided cluster.

```bash
ansible-playbook delete-ebs-volume.yml -vv --extra-vars "cluster_name=<aws-cluster-name>"
```