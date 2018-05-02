This folder will contains the code that can help executing all or a subset of tests. There can be many 
different ways of executing a series of tests, for example, Ansible is one of the ways to execute the tests. 

The executor helps with performing the following functions: 

- Creation of Kubernetes clusters - on-premise(kubeadm), cloud (AWS, Azure, GKE) , embedded (OpenShift)
- Setup the storage provider (operators, where applicable) on the Kubernetes cluster 
- Perform batch execution of Litmus tests with ability to select/skip tests 
- Consolidate test logs & reports for dashboarding purposes
