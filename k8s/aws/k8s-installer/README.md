# AWS platform specific code and scripts
## Amazon web service and setting up Kubernetes cluster using KOPS
These playbook act as a wrapper class for all the `kops`, `aws`  command. 

### Prerequisites
- kubectl
- aws
- kops

### Setting up

- Run `aws configure`, and authenticate into your aws account linked with the AWS Cloud

### Setup pre-requiste

- Run `pre-requisite` using anisble-playbook, that will create a Virtual Private Cloud, Subnet, Internet-Gateway and route-table.

```bash
ansible-playbook pre-requisite.yml -vv
```
**Optional**

- User can also provide the VPC name at the time of creation in `--extra-vars`

```bash
ansible-playbook pre-requisite.yml -vv --extra-vars "vpc_name=<name-of-vpc>"
```
### Creating AWS Cluster

- Run `create-aws-cluster`, this will create a ssh public key, Bucket and the AWS cluster.

```bash
ansible-playbook create-aws-cluster.yml -vv --extra-vars "k8s_version=<Kubernetes_version>"
```
**Optional**
- User can also provide the Cluster name at the time of creation in `--extra-vars`

```bash
ansible-playbook create-aws-cluster.yml -vv --extra-vars "k8s_version=<Kubernetes_version> cluster_name=<name-of-cluster>"
```
### Deleting AWS cluster

- Run `delete-aws-cluster`, this will delete the cluster as well as the Bucket associated with it.

```bash
ansible-playbook delete-aws-cluster.yml -vv
```

### Deleting Pre-requiste

- Run `delete-pre-requisite` to delete the existing VPC, Subnets, Internet-Gateway and route-table.

```bash
ansible-playbook delete-pre-requisite.yml -vv
```

