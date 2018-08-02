# GCP platform specific code and scripts
## Google Cloud provisioning and setting up Kubernetes cluster using KOPS
These playbook act as a wrapper class for all the `kops`, `gsutil` & `gcloud` command. 

### Prerequisites
- kubectl
- gcloud
- kops

### Setting up

- Run `glcloud init`, and authenticate into your google account linked with the Google Cloud

---

### Running

- Run `create-vpc.yml` using anisble-playbook, that will create a Virtual Private Cloud
```bash
ansible-playbook create-vpc.yml --extra-vars "project=<project-name> vpc_name=<vpc-name>"
```

- Run `create-k8s-cluster`, this will create a Bucket and the cluster

```bash
ansible-playbook create-k8s-cluster.yml -vv --extra-vars "project=<project-name> nodes=1 vpc_name=<vpc-name>"
```
**Optional --extra-vars**

> k8s_version=1.11.1
> cluster_name=my-Cluster

---

### Deleting the cluster

- Run `delete-k8s-cluster`, this will delete the cluster as well as the Bucket associated

```bash
ansible-playbook delete-k8s-cluster.yml
```
**Optional --extra-vars**

> cluster_name=my-Cluster

It will delete the cluster specified else it will delete the last created cluster.
If you have created **multiple** cluster, you have to specify the, existing cluster name to be deleted in extra-vars.

- Run `delete-vpc` to delete the existing VPC (if required)
```bash
ansible-playbook delete-vpc.yml --extra-vars "project=<project-name> vpc_name=<vpc-name>"
```

