# EKS platform specific code and scripts
## Setting up Amazon Elastic Container Service for Kubernetes using Ansible
The playbook uses weaveworks `eksctl` to bring up a cluster on EKS. 

### Prerequisites
- kubectl
- eksctl >= 0.1.5
- Python Library: boto
- Python Library: boto3

### Setting up

- Create `.aws` directory in user home and drop the `credentials` file in the directory.
- Run `aws configure`, and authenticate your credentials with AWS.
- Set region as us-west-2.
- Set Up the following environment variables.

```
export AWS_ACCESS_KEY_ID=<aws_access_key_id>
export AWS_SECRET_ACCESS_KEY=<aws_secret_access_key>
```
---

### Running

- Run `create-eks-cluster.yml`, to bring up a 3 node kubernetes cluster.

```bash
ansible-playbook create-eks-cluster.yml 
```
**Optional --extra-vars**

> initial_node_code=3
> cluster_name=my-Cluster

```bash
ansible-playbook create-eks-cluster.yml --extra-vars "cluster_name=my-Cluster initial_node_count=3"
```
---

### Deleting the cluster

- Run `delete-eks-cluster.yml`, this will delete the cluster.

```bash
ansible-playbook delete-eks-cluster.yml
```
This will delete the cluster which was last created using the `create-eks-cluster.yml`.

**Optional --extra-vars**

> cluster_name=my-Cluster

```bash
ansible-playbook delete-eks-cluster.yml --extra-vars "cluster_name=my-Cluster"
```
---

It will delete the cluster which was provided as an extra-vars.
If you have created **multiple** clusters, you will have to explicitly specify the name of existing cluster to be deleted in extra-vars.