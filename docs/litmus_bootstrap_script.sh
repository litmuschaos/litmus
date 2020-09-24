#!/bin/bash

# This script will
# 1. list all the litmus components
# 2. remove all litmus component and uninstall litmus
# 3. install the latest/any desired version of litmus

set -e

list_all(){
  if [[ -z "$1" ]]; then
    echo "Getting all chaosresources from default namespaces ..."
    kubectl get chaosengine,chaosexperiment,chaosresult
  else 
    echo "Getting all chaosresources from ${1} namespace ..."
    kubectl get chaosengine,chaosexperiment,chaosresult -n ${1}
  fi
}

up_litmus(){
  if [[ -z "$1" ]]; then
    echo "Installing litmus 1.8.1 ..."
    kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v1.8.1.yaml
  else
    echo "Installing litmus ${1} ..."
    kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v${1}.yaml
  fi

  n=0
  until [[ "$n" -ge 90 ]]
  do
    status=$(kubectl get pods -n litmus -o jsonpath='{.items[*].status.phase}')
    if [ "$status" != "Running" ];then
      echo "Operator status is $status please wait ..."
    else
      echo "Litmus installed successfully!!!"
      break
    fi
  done
}


delete_chaosengine () {
  echo "Removing chaosengine ..."
  command="kubectl delete chaosengine --all --all-namespaces"
  eval $command
  n=0
  until [[ "$n" -ge 90 ]]
  do
    response=$(eval "$command")
    if [[ "$response" != "No resources found"  ]];then
      echo "waiting for chaosengine cleanup..."
      sleep 2
    else 
      break
    fi
  done
}

delete_chaosexperiment () {
  echo "Removing chaosexperiment ..."
  command="kubectl delete chaosexperiment --all --all-namespaces"
  eval "$command"
  n=0
  until [[ "$n" -ge 90 ]]
  do
    response=$(eval "$command")
    if [[ "$response" != "No resources found"  ]];then
      echo "waiting for chaosexperiment cleanup..."
      sleep 2
    else 
      break
    fi
  done
}

delete_crds(){
  echo "Removing crds ..."
  kubectl delete -f https://raw.githubusercontent.com/litmuschaos/chaos-operator/master/deploy/chaos_crds.yaml
  n=0
  until [[ "$n" -ge 90 ]]
  do 
    response=$(kubectl get crds -o jsonpath='{.items[*].spec.group}' )
    if [[ "$response" == *"litmuschaos.io"* ]]; then
      echo "unable to cleanup crd ..."
      exit 1
    else
      echo "crds deleted successfully!!"
      break
    fi
  done
}

delete_litmus_rbac(){

  echo "Removing litmus rbac ..."
  sa=`kubectl get sa | grep litmus | awk '{print$1}'`
  if [[ "$sa" == "litmus" ]];then
    kubectl delete sa litmus -n litmus
  fi

  clusterrole=`kubectl get clusterrole | grep litmus | awk '{print$1}'`
  if [[ "$clusterrole" == "litmus" ]];then
    kubectl delete clusterrole litmus
  fi

  clusterrolebinding=`kubectl get clusterrolebinding | grep litmus | awk '{print$1}'`
  if [[ "$clusterrolebinding" == "litmus" ]];then
    kubectl delete clusterrolebinding litmus
  fi

  litmusAdminClusteRole=`kubectl get clusterrole | grep litmus-admin | awk '{print$1}'`
  if [[ "$litmusAdminClusteRole" == "litmus-admin" ]];then
    kubectl delete clusterrole litmus-admin
  fi

  litmusAdminClusterRoleBinding=`kubectl get clusterrolebinding | grep litmus-admin | awk '{print$1}'`
  if [[ "$litmusAdminClusterRoleBinding" == "litmus-admin" ]];then
    kubectl delete clusterrolebinding litmus-admin
  fi  
}

delete_namespace(){
  echo "Removing litmus namespace ..."
  kubectl delete ns litmus
  n=0
  until [[ "$n" -ge 90 ]]
  do 
    response=$(kubectl get ns | grep litmus)
    if [ -z "$response" ]; then
      echo "wating for litmus namespace cleanup"
      sleep 2
    else
      break
    fi
  done  
}

litmus_down(){
  delete_chaosengine
  delete_chaosexperiment
  delete_crds
  delete_litmus_rbac
  delete_namespace
}


print_help(){
cat <<EOF
Usage: ${0} ARGS (up|down|list)

up:          "${0} up" will install litmus
  
down:        "${0} down" will remove all litmus components and delete litmus

list:        "${0} list" will list the litmus components from a specific namespace

--------------------------------------------
Arguments available when using up subcommand
---------------------------------------------

version:     We can install any specific version of litmus by passing an argument with "${0} up".
             Example: "${0} up 1.8.1" will install the 1.8.1 version of litmus.
             By default, it will install the latest version of litmus
        
----------------------------------------------
Arguments available when using list subcommand
----------------------------------------------

namespace:   It will list all the litmus components from a perticular namespace.
             Example: "${0} up test" will list out the litmus components from the test namespace.
             By default, it will list the litmus component from the default namespace        

EOF

}


case ${1} in
  list)
    list_all "${2}"
    ;;
  down)
    litmus_down
    ;;
  up)
    up_litmus "${2}"
    ;;
  *)
    print_help
    exit 1
esac
