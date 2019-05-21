#!/bin/bash

error_handler()
{
rc=$1; message=$(echo $2 | cut -d "=" -f 2); act=$(echo $3 | cut -d "=" -f 2)
if [ $rc -ne 0 ]; then
  echo "$message"
  if [ "$act" == "exit" ]; then
    exit 1 
  fi
fi
}

default_kube_config_path="$HOME/.kube/config"
read -p "Provide the KUBECONFIG path: [default=$default_kube_config_path] " answer
: ${answer:=$default_kube_config_path}

echo "Selected kubeconfig file: $answer"

echo "Applying the litmus RBAC.."
kubectl apply -f rbac.yaml; retcode=$?
error_handler $retcode msg="Unable to setup litmus RBAC, exiting" action="exit"

echo "Applying the litmus(chaos) experiment result CRDs.."
kubectl apply -f crds.yaml; retcode=$?
error_handler $retcode msg="Unable to create result CRDs, exiting" action="exit"

cp $answer admin.conf; retcode=$?
error_handler $retcode msg="Unable to find the kubeconfig file, exiting" action="exit"

echo "Creating configmap.."
kubectl create configmap kubeconfig --from-file=admin.conf -n litmus; retcode=$?
error_handler $retcode msg="Unable to create kubeconfig configmap, exiting" action="exit"

