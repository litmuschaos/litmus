## Create Kubernetes Cluster for CI in Azure Cloud (AKS)

> **Pre-requisites**
> - Azure CLI
> - Ansible 

### **Steps**:

To create a cluster you need to authenticate the Azure CLI at the first place. 

```bash
 az login -u <username> -p <password> 
```
- To create a cluster:
```bash
ansible-playbook create-k8s-cluster.yml --extra-vars "nodes=3 node_vm_size=Standard_D3"
```

- To delete the cluster

```bash
ansible-playbook delete-k8s-cluster.yml
```
> Optionally, you can also pass the cluster name in the `extra-vars` while running Creation/Deletion playbook

**NOTE**: Currently the total node count is 3 and VM Size is set to `Standard_D3`.