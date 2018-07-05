#!/bin/bash

#######################################################################################################################
# Script Name   : bench_runner.sh         									      		
# Description   : Run vdbench I/O using the filesystem templates on the /datadir. 
# Creation Data : 20/12/2016                                                                                          
# Modifications : None											               		
# Script Author : Karthik											      
#######################################################################################################################

TEST_TEMPLATE="file/basic-rw"
TEST_DIR="datadir"
TEST_SIZE="256m"
TEST_DURATION=60

# Function definition 

function show_help(){
    cat << EOF
Usage :       $(basename "$0") --template
              $(basename "$0") --size
              $(basename "$0") --duration
              $(basename "$0") --help

-h|--help    Display this help and exit  
--template   Select the fio template to run 
--size	     Provide the data sample size (in MB)
--duration   Duration (in sec) 

Example: ./fio_runner.sh --template file/basic-rw --size 1024m --duration 120  

EOF
}

while [[ $# -gt 0 ]]
do 
    case $1 in
        -h|-\?|--help) # Display usage summary
                       show_help
                       exit
                       ;;
        
        --template)    # Optional argument to specify fio profile 
                       if [[ -n $2 ]]; then
                           TEST_TEMPLATE=$2
                           if ! ls templates/$TEST_TEMPLATE > /dev/null 2>&1; then
                               echo "ERROR: Template specified does not exist"
                               exit 1 
                           fi 
                           shift 
                       else
                           echo 'ERROR: "--template" requires a valid fio profile'
                           exit 1
                       fi
                       ;;

        --size)        # Optional argument to specify data sample size 
                       if [[ -n $2 ]]; then
                           TEST_SIZE=$2
                           shift
                       else
                           echo 'ERROR: "--size" requires a valid data sample size in MB' 
                           exit 1 
                       fi 
                       ;;
         
        --duration)    # Optional argument to specify fio run duration 
                       if [[ -n $2 ]]; then
                           TEST_DURATION=$2
                           shift
                       else
                           echo 'ERROR: "--duration" requires a valid time period in sec'
                           exit 1 
                       fi 
                       ;; 
 
         --)           # End of all options 
                       shift 
                       break
                       ;;

         *)            # Default case: If no options, so break out of the loop
                       break
    esac
    shift

done                          
                          
#Verify that the datadir used by the templates is mounted
if ! df -h -P | grep -q datadir > /dev/null 2>&1; then
    echo -e "datadir not mounted successfully, exiting \n"
    exit 1
fi

# Start fio I/O iterating through each template file
timestamp=`date +%d%m%Y_%H%M%S`
for i in `ls templates/${TEST_TEMPLATE}`
do
   profile=$(basename $i)
   echo -e "\nRunning $profile test with size=$TEST_SIZE, runtime=$TEST_DURATION... Wait for results !!\n"
   fio $i --size=$TEST_SIZE --runtime=$TEST_DURATION --output-format=json
done  

