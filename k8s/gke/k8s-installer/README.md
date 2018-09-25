# GKE platform specific code and scripts
## Google Cloud provisioning and setting up Kubernetes cluster using Ansible
The playbook uses google's ansible module `gcp_container_cluster` to bring up a cluster on GKE. 

### Prerequisites
- kubectl
- gcloud
- Python Library: requests >= 2.18.4
- Python Library: google-auth >= 1.3.0

### Setting up

- Run `glcloud init`, and authenticate into your google account linked with the Google Cloud
- Set Up the following environment variables.

```
export GCP_SERVICE_ACCOUNT_FILE=<path_of_service_account_json>
export GKEUSER=<user_mail_id_for_service_account>
```
---

### Running

- Run `create-gke-cluster.yml`, to bring up a 3 node kubernetes cluster.

```bash
ansible-playbook create-gke-cluster.yml 
```
**Optional --extra-vars**

> initial_node_code=3
> cluster_name=my-Cluster

```bash
ansible-playbook create-gke-cluster.yml --extra-vars "cluster_name=my-Cluster initial_node_count=3"
```
---

### Deleting the cluster

- Run `delete-gke-cluster.yml`, this will delete the cluster.

```bash
ansible-playbook delete-gke-cluster.yml
```
This will delete the cluster which was last created using the `create-gke-cluster.yml`.

**Optional --extra-vars**

> cluster_name=my-Cluster

```bash
ansible-playbook delete-gke-cluster.yml --extra-vars "cluster_name=my-Cluster"
```
---

It will delete the cluster which was provided as an extra-vars.
If you have created **multiple** clusters, you will have to explicitly specify the name of existing cluster to be deleted in extra-vars.