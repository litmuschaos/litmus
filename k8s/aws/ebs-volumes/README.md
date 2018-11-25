
# AWS platform specific code and scripts

## Amazon web service and Attaching EBS Volume in Provided Kubernetes cluster

### Pre-requisites

- AWS Cluster is up and running
- Disable ansible host key checking `export ANSIBLE_HOST_KEY_CHECKING=False`

#### Execution and Inventory Requirements

- Public IPs of VMs/Nodes
- SSH connection to VMs/Nodes
- `delegate_to` and `with_items` ansible module use for SSH in VMs/Nodes and loop on each VMs/Nodes respectively

### Creating, attach and mount EBS Volume in AWS Cluster

- `create-ebs-volume`, will create, attach and mount EBS volume to each node of provided cluster name.

```bash
ansible-playbook create-ebs-volume.yml -vv --extra-vars "cluster_name=<aws-cluster-name>"
```

Example:

```bash
ansible-playbook create-ebs-volume.yml -vv --extra-vars "cluster_name=nodes.k8s-compassionate-babbage.k8s.local"
```

### Unmount, Detach and delete EBS Volume in AWS cluster

- `delete-ebs-volume`, will unmount, detach and delete EBS volume from the provided cluster.

```bash
ansible-playbook delete-ebs-volume.yml -vv --extra-vars "cluster_name=<aws-cluster-name>"
```

Example:

```bash
ansible-playbook delete-ebs-volume.yml -vv --extra-vars "cluster_name=nodes.k8s-compassionate-babbage.k8s.local"
```