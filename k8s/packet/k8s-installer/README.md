# Packet (Bare Metal) specific code and scripts

## setting up Kubernetes cluster using kubeadm

These playbook act as a wrapper class for all the `kubeadm` and `packet`  command. 

### Prerequisites

- Ansible
- packet-python >= 1.35
- packet api token (https://app.packet.net/users/example-id-cb2c1b67cc9/api-keys)
- project_id of packet cloud
- `packet` directory present in location `/tmp`

### Creating k8s cluster in packet

- Run `create_packet_cluster`, this will generate ssh public key and k8s cluster in packet.

```bash
export PACKET_API_TOKEN=<api-token>

ansible-playbook create_packet_cluster.yml --extra-vars "k8s_version=<version>" -vv
```

**example** :- ansible-playbook create_packet_cluster.yml --extra-vars "k8s_version=1.10.0-00" -vv

**Optional**

--extra-vars:

1. k8s-version:
   To get the available kubeadm versions run the below steps as a sudo user:

   ```bash
   apt-get update && apt-get install -y curl
   curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
   touch /etc/apt/sources.list.d/kubernetes.list
   sh -c 'echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" > /etc/apt/sources.list.d/kubernetes.list'
   apt-get update
   apt-cache madison kubeadm
      kubeadm |  1.11.3-00 | https://apt.kubernetes.io kubernetes-xenial/main amd64 Packages
      kubeadm |  1.10.8-00 | https://apt.kubernetes.io kubernetes-xenial/main amd64 Packages
   ```

2. clustername:

- User can also provide the Cluster name at the time of creation

```bash
ansible-playbook create_packet_cluster.yml -vv --extra-vars "k8s_version=1.11.3-00 cluster_name=<name-of-cluster>"
```

3. Taint Node:

```bash
ansible-playbook create_packet_cluster.yml -vv --extra-vars "k8s_version=1.11.3-00 taint_value=<taint_value>"
```

example:

```bash
ansible-playbook create_packet_cluster.yml -vv --extra-vars "k8s_version=1.11.3-00 taint_value=ak=av:NoSchedule"
```

### Deleting k8s cluster in packet

- Run `delete_packet_cluster`, this will delete the cluster as well as ssh key.

```bash
ansible-playbook delete_packet_cluster.yml -vv
```