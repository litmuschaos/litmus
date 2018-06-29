#!/bin/bash

DB_PREFIX="tpcc"
DB_SUFFIX=`echo $(mktemp) | cut -d '.' -f 2`
DB_NAME="${DB_PREFIX}-${DB_SUFFIX}"

if [ $# -lt 2 ];
then
  echo "Usage: sh tpcc-runner.sh <db_server_ip_address> <path/to/tpcc.conf>"
  exit 1
fi 

DB_SERVER_IP=$1

T_P=($(jq -r .[] $2))
if [ $? -ne 0 ];
then
 echo -e "\nFailed to parse tpcc params, exiting\n"
 exit 1
fi 

# TPC-C VARS LOOKUP TABLE
#
# db_user     : ${T_P[0]} 
# db_password : ${T_P[1]}
# warehouses  : ${T_P[2]}
# connections : ${T_P[3]} 
# warmup      : ${T_P[4]}
# runtime     : ${T_P[5]}
# interval    : ${T_P[6]}

echo -e "\nWaiting for mysql server to start accepting connections.."
retries=10;wait_retry=30
for i in `seq 1 $retries`; do 
  mysql -h $DB_SERVER_IP -u${T_P[0]} -p${T_P[1]} -e 'status' > /dev/null 2>&1
  rc=$?
  [ $rc -eq 0 ] && break
  sleep $wait_retry 
done 

if [ $rc -ne 0 ];
then
  echo -e "\nFailed to connect to db server after trying for $(($retries * $wait_retry))s, exiting\n"
  exit 1
fi


echo -e "\nCreating database.."
mysqladmin -h $DB_SERVER_IP create $DB_NAME --user=${T_P[0]} --password=${T_P[1]} > /dev/null 2>&1
if [ $? -ne 0 ];
then
  echo -e "\nFailed to create database, exiting\n"
  exit 1
fi

echo -e "\nCreating tables.."
mysql -h $DB_SERVER_IP -u${T_P[0]} -p${T_P[1]} $DB_NAME < create_table.sql > /dev/null 2>&1
if [ $? -ne 0 ];
then
  echo -e "\nFailed to create tables, exiting\n"
  exit 1
fi

echo -e "\nLoading database.."
./tpcc_load -h$DB_SERVER_IP -P3306 -d$DB_NAME -u ${T_P[0]} -p ${T_P[1]} -w ${T_P[2]}
if [ $? -ne 0 ];
then
  echo -e "\nFailed to load database, exiting\n"  
  exit 1
fi

echo -e "\nRunning benchmark.."
./tpcc_start -h$DB_SERVER_IP -P3306 -d$DB_NAME -u${T_P[0]} -p${T_P[1]} -w${T_P[2]} -c${T_P[3]}\
 -r${T_P[4]} -l${T_P[5]} -i${T_P[6]}
if [ $? -ne 0 ];
then
  echo -e "\nFailed to run benchmark, exiting\n"
  exit 1
fi


