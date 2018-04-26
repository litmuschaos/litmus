#!/bin/bash


# TODO
# Functions : a) Ansible health-check b) K8s health-check
# Improved Error handling 

###################################
# Perform a sample Health check   #
###################################

# Is ansible present, if not install
if [ ! $(which ansible) ]; then
  echo "Please install ansible..(pip install ansible)"
  exit 1
fi

# Is inventory generated?
if [ ! -s inventory/hosts ]; then
  echo "Inventory file is not available.."
  echo "Generate inventory w/ host details..(Edit machines.in, Run pre-requisites.yml)" 
  exit 1
fi 

###################################
#     Setup Storage Provider      # 
###################################

storage=$(grep "provider" inventory/group_vars/all.yml | cut -d ":" -f 2 | xargs) 
ansible-playbook provider/$storage/setup-$storage.yml

###################################
#     Run Litmus Test Suite       #
###################################

ansible-playbook litmus_playbook.yml


