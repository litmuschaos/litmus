#!/bin/bash

#############################################################
# This is a script that will run aggregate the logs of the 
# kubernetes pods in the cluster. It also collects the ouput 
# of certain kubectl commands that help in analyzing cluster
# state. 
#
# TODO: Get node's systemd logs 
#
#############################################################

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

# Instantiate stern logging on the selected pods w/ respective logfiles
for i in $podregex; do
    stern $i* --kubeconfig=/root/admin.conf > /mnt/$i.log 2>&1 &
done 

# Collect logs in the background for specified duration
sleep $(($logtime*60)) 

# Zip the pod logs & cleanup
cd /mnt && tar -cvf Logstash_$(date +"%d_%m_%Y_%I_%M_%p").tar *.log && rm -f *.log 



