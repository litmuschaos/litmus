#!/bin/sh

#######################################################################################################################
# Script Name   : bench_runner.sh         									      		
# Description   : Run vdbench I/O using the filesystem templates on the /datadir. 
# Creation Data : 20/12/2016                                                                                          
# Modifications : None											               		
# Script Author : Karthik											      
#######################################################################################################################

TEST_TEMPLATES="Basic"
TEST_DURATION=60
TEST_DIR="datadir1"
IS_LOCAL_DIR=1

# Function definition 

# Use this to update the size of the volume
updateTemplates() {
  for i in `ls templates/${TEST_TEMPLATES}/File*`; do sed -e "s|anchor=/datadir1|anchor=/$TEST_DIR|g" -i $i; done
  for i in `ls templates/${TEST_TEMPLATES}/File*`; do sed -e "s|elapsed=60|elapsed=$TEST_DURATION|g" -i $i; done
}


if [ $# -gt 0 ];
then
  echo "Setting the test templates as $1"
  TEST_TEMPLATES=$1
  if [ ! -d "templates/$TEST_TEMPLATES" ]; then
    echo "Specified templates do not exist."
    exit 1
  fi
fi

if [ $# -gt 1 ];
then
  echo "Setting the duration for tests as $2"
  TEST_DURATION=$2
fi

if [ $# -gt 2 ];
then
  echo "Setting the test to local directory /tmp/$3"
  TEST_DIR="tmp/$3"
  IS_LOCAL_DIR=2
fi


#Verify that the datadir1 used by the templates is mounted
if [ 2 -ne $IS_LOCAL_DIR ]; then
  df -h -P | grep -q datadir1
  if [ `echo $?` -ne 0 ]; then 
    echo -e "datadir1 not mounted successfully, exiting \n"
    exit
  else 
    echo "datadir1 mounted successfully"
  fi
else
  mkdir -p /$TEST_DIR
  if [ `echo $?` -ne 0 ]; then 
    echo -e "/$TEST_DIR could not be created, exiting \n"
    exit
  fi
  rm -rf /$TEST_DIR/*
  echo "using /$TEST_DIR for testing"
fi

updateTemplates

# Start vdbench I/O iterating through each template file
timestamp=`date +%d%m%Y_%H%M%S`
echo -e "Running $TEST_TEMPLATES Workloads\n" 
pwd
id

for i in `ls templates/${TEST_TEMPLATES}/ | cut -d "/" -f 3`
do
 echo "######## Starting workload -- $i#######"
 ./vdbench -f templates/${TEST_TEMPLATES}/$i -o output-$i-$timestamp 	
 echo "######## Ended workload -- $i#######"
done  

