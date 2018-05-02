The setup folder consists of playbooks that help create/build a Kubernetes based test environment of which to execute
Litmus. Current capabilities include: 

- Creation of ansible inventory (pre-requisites.yml)
- Setup a multi-node Kubernetes cluster using kubeadm (setup-kubernetes.yml) 
- Install ARA a stdout callback plugin that records playbook logs 


