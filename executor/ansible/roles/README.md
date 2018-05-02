# Ansible Roles 
---------------

Ansible "roles" are reusable abstractions which can be created based on an overall function performed by a set of
tasks, and can be included into playbooks. Each role has a default structure with ```vars```, ```defaults``` ,```tasks```,
```meta``` and ```handler``` folders, with each containing a ```main.yml``` file. 

- The vars & defaults folders consist of variables used by the tasks in the role. 
- The meta folder contains role dependencies, i.e., tasks to be run before running current role tasks
- The handler takes care of service handling and is invoked by the ```notify``` keyword inside tasks

A brief outline of the functions associated with above components is described below :

- prerequisites : Installs python packages necessary for inventory generation

- inventory : Generates the hosts file based on entries in ansible/inventory/machines.in.

- k8s-localhost* : Prepares the test-harness for execution of kubernetes roles

- kubernetes* : Installs kubernetes packages with dependencies 

- k8s-master* : Configures the kubernetes-master

- k8s-host* : Configures the kubernetes-minions.

- k8s-openebs-operator : Installs the OpenEBS control plane (kubernetes operator) via kubectl 

- k8s-openebs-operator-helm : Installs OpenEBS helm charts 

- k8s-openebs-cleanup : Removes the OpenEBS operator via kubectl 

- k8s-openebs-uninstall-helm : Purges the OpenEBS helm chart 

- logging : Consolidates & compresses pod logs (collected by stern)

- ara : Installs ARA as a systemd service ansible host


