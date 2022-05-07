# How to Run Custom Provider

## This file will help you to use the custom built terraform provider for LitmusChaos

- Clone the repo.
- Switch to ```terraform``` branch.
- ```cd terraform```
- If ```go.mod``` does not exist, run ```go mod init main && go mod tidy```
- Build the binary file for the provider, run ```go build -o terraform-provider-example```
- Test by running this: ```./terraform-provider-example```
- Now, since the provider is not hosted we need to save this binary locally in the terraform plugins directory.
- Make sure you system has Terraform installed.
- Run ```mkdir -p ~/.terraform.d/plugins/kitarp.com/trying/example/1.0.0/linux_amd64```
- Run ```cp terraform-provider-example ~/.terraform.d/plugins/kitarp.com/trying/example/1.0.0/linux_amd64```
- We copy the binary to the plugins dir. It will use the local folder instead of looking it up.
- Now, it's time to spin up a local **kubernetes** cluster.
- Create the ```litmus``` namespace.
- Run: ```kubectl create namespace litmus```
- Now, we run the terraform script to install **LitmusChaos**.
- ```cd tf_files```
- ```terraform init```
- ```terraform plan```
- ```terraform apply```, when prompted type *yes*.
- Litmuschaos should be installed in the local k8s Cluster.
- Check using ```kubectl get po -n litmus```
  