#!/bin/bash
file=./all.csv
var=0;

update_file()
{
while IFS=':' read -r col1 col2 col3; do
  echo "$col2:$col3"
  test="${col3%-*}"
  ansible-playbook ./utils/execute.yml -e "LABEL="$col3" PATH="$col2" TYPE="$col1" TESTNAME="$test"" -vv
done < $file
}

if [ ! -e $file ]; then
 echo Unable to find CSV file 
else 
 touch result.csv
 update_file 
 var="$(cat result.csv | grep Pass | wc -l)"
 echo "Number of test Passed: $var" >> result.csv
 cat result.csv
 #rm result.csv
fi
