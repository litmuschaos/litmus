#!/bin/bash

#############################################################
# This is a script that will aggregate the logs of selected 
# kubernetes pods in the cluster. It also collects the host 
# systemd (kubelet) logs and output of certain kubernetes 
# (kubectl) commands that help in analyzing cluster state. 
#############################################################


#######################
##   FUCNTION DEF    ##       
#######################

function show_help(){
    cat << EOF
Usage : $(basename "$0") -h help
        $(basename "$0") -d <min>
        $(basename "$0") -r <string>

-h  	Display this help and exit
-d      Duration for log collection in minutes, ex: 10
-r      Comma-separated string with starting literals of pod names, ex: pvc,maya

Example: ./logger.sh -d 10 -r pvc,maya,openebs
EOF
}

function wait_for_sonopods(){
# Checks whether the node-logger pods are in "Running" state

pTimeOut=$1 && shift
pList=($@)

echo -n "Waiting for sonopods to run"

for i in ${pList[@]}; do
  c=1
  while [[ $c -lt $pTimeOut && $(kubectl get pod $i -o go-template --template "{{.status.phase}}") != "Running" ]]; do
    sleep 1
    ((c++))
    echo -n "."
  done
  if [ $c -eq $pTimeOut ]; then
    echo "Unable to bring up node-logger pods, exiting.."
    exit 1
  fi
done
echo
}

function wait_for_logdump(){
# Check whether the node logs are dumped successfully

pList=($@)

echo -n "Waiting for node log collection to complete"

for i in ${pList[@]}; do
  while [[ -z $(kubectl exec $i -- ls /tmp/results/done) ]]; do
    sleep 1
    echo -n "."
  done
done
echo
}

#######################
## VERIFY ARGUMENTS  ##
#######################

if (($# == 0)); then
    show_help
    exit 2
fi

# Obtain the logging duration & pod-regex information
while getopts ":h:d:r:" option  
do
    case $option in

         h)  # Display help/usage 
             show_help
             exit
             ;;
   
         d)  # Ensure duration is specified
             # Set the sleep/wait variable
             logtime=${OPTARG}
             ;;
        
         r)  # Ensure that the pod regex is specified
             # Set the stern regex string variable
             podregex=`echo ${OPTARG} | sed 's/,/ /g'`
             ;; 

         *)  # Undesired arguments 
             echo "Incorrect arguments provided, please check usage"
             show_help
             exit 1 
             ;;
    esac
done 


#######################
##   TEST VARIABLES  ##
#######################

# Time to wait for node-logger daemonset to instantiate
podTimeOut=120

########################
##   RUN TEST STEPS   ##
########################		 

#%% STEP1: Get cluster state %%#

# kubectl command list
declare -a kube_array=("kubectl get nodes"
                       "kubectl get pods --all-namespaces"
                       "kubectl get services"
                       "kubectl get sc"
                       "kubectl get pv"
                       "kubectl get pvc")


# Obtain cluster info via kubectl command outputs 
for i in "${kube_array[@]}"
do
  strout='echo "### $i ###" && $i && echo "---"'
  eval $strout >> /mnt/kubectl_cluster_info.log                           
done

#%% STEP2: Get Pod Logs %%#

# Instantiate stern logging on the selected pods w/ respective logfiles
for i in $podregex; do
    stern $i* --kubeconfig=/root/admin.conf --all-namespaces > /mnt/$i.log 2>&1 &
done 

# Collect logs in the background for specified duration
sleep $(($logtime*60)) 

#%% STEP3: Get Node Logs %%#

# Deploy the node-logger daemonset
kubectl apply -f nodelogger.yaml

# Get the list of pods in the node-logger daemonset
sonoPods=$(kubectl get pods --no-headers -l app=sono -o custom-columns=:metadata.name)

# Check if node-logger pods are running
wait_for_sonopods $podTimeOut $sonoPods;

# Wait for node logs to be collected
wait_for_logdump $sonoPods;

echo "systemd logs collected on all nodes"

# Remove the node-logger daemonset
kubectl delete -f nodelogger.yaml

#%% STEP4: Process logs %%#

# Zip the pod logs & cleanup
cd /mnt && tar -cvf Logstash_$(date +"%d_%m_%Y_%I_%M_%p").tar *.log && rm -f *.log  

