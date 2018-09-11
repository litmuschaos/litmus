# Packet (Bare Metal) specific code and scripts

## setting up Kubernetes cluster using kubeadm

These playbook act as a wrapper class for all the `kubeadm` and `packet`  command. 

### Prerequisites

- Ansible
- packet-python >= 1.35
- packet api token (https://app.packet.net/users/example-id-cb2c1b67cc9/api-keys)
- project_id

### Creating k8s cluster in packet

- Run `create_packet_cluster`, this will generate ssh public key and k8s cluster in packet.

```bash
export PACKET_API_TOKEN=<api-token>

ansible-playbook create_packet_cluster.yml -vv
```

**Optional**

- User can also provide the Cluster name at the time of creation in `--extra-vars`

```bash
ansible-playbook create_packet_cluster.yml -vv --extra-vars cluster_name=<name-of-cluster>"
```

### Deleting k8s cluster in packet

- Run `delete_packet_cluster`, this will delete the cluster as well as ssh key.

```bash
ansible-playbook delete_packet_cluster.yml -vv
```