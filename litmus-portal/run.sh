#!/bin/bash

# ENV VAR SETUP
export DB_SERVER=mongodb://localhost:27017
export JWT_SECRET=litmus-portal@123
export PORTAL_ENDPOINT=http://localhost:8080
export SELF_CLUSTER=false # self-cluster needs k8s env
export AGENT_SCOPE=cluster
export AGENT_NAMESPACE=litmus
export LITMUS_PORTAL_NAMESPACE=litmus
export PORTAL_SCOPE=namespace
export SUBSCRIBER_IMAGE=litmuschaos/litmusportal-subscriber:ci
export ARGO_SERVER_IMAGE=argoproj/argocli:v2.9.3
export ARGO_WORKFLOW_CONTROLLER_IMAGE=argoproj/workflow-controller:v2.9.3
export ARGO_WORKFLOW_EXECUTOR_IMAGE=argoproj/argoexec:v2.9.3
export LITMUS_CHAOS_OPERATOR_IMAGE=litmuschaos/chaos-operator:1.8.2
export LITMUS_CHAOS_RUNNER_IMAGE=litmuschaos/chaos-runner:1.8.2
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=litmus
export DB_USER=admin
export DB_PASSWORD=1234
# Dependency Checks
dir=($(pwd | tr "/" "\n"))
count=${#dir[@]}
if  [ "$count" -lt 2 ] || [ "${dir[-2]}" != "litmus" ] || [ "${dir[-1]}" != "litmus-portal" ] ; then
  echo "Error : Run script only in litmus/litmus-portal dir";
  exit 1;
fi


if [ $1 = "gql" ]; then
  cd ./graphql-server && go run server.go;
elif [ $1 = "auth" ]; then
  cd ./authentication && go run src/main.go;
else printf "Error: Wrong Server Try Again\nUsage: \n  - bash run.sh gql\n  - bash run.sh auth\n";
fi