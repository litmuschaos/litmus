
# GCE platform specific code and scripts

## Attaching and Mounting Google Persistent Disks to Cluster's Nodes

### Pre-requisites

- Cluster in GCE is up, running and accesible.
- Service account JSON and email with sufficient privilege to Disks and Compute Engine access


### Creating, attaching and mounting GPDs in worker nodes

- `create-gpd.yml`, will create, attach and mount the GPD to each worker node of given cluster, sequentially.

```bash
ansible-playbook create-gpd.yml --extra-vars "cluster_name=<cluster-name> json=<credential-file> email=<service-email> project=<project-name>"
```
** If you don't specify the cluster name, it will by read the `~logs/cluster` to get the name by default.

### Unmount, Detach and delete GPDs in worker nodes

- `delete-gpd.yml`, will unmount, detach and delete disks from each worker node of specified cluster.

```bash
ansible-playbook delete-gpd.yml --extra-vars "cluster_name=<cluster-name> json=<credential-file> email=<service-email> project=<project-name>"
```