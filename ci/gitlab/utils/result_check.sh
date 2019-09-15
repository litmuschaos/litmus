#!/bin/bash

result_check_retry_limit=5; result_check_retry_count=0
result_check_cmd="kubectl get chaosresult $1 -o custom-columns=:spec.experimentstatus.verdict --no-headers 2> /dev/null"

echo "## start chaos job monitor ##"

while true; do
  job_state=$(eval ${result_check_cmd}); rc=$?
  if [[ $rc -eq 0 && ! -z $job_state ]]; then
    if [[ $job_state =~ 'running' ]] ; then
      sleep 5
    else
      echo "job state: $job_state"
      if [[ $job_state == 'fail' ]]; then
        exit 1
      fi
      break;
    fi
  else
    if [[ ${result_check_retry_count} -le ${result_check_retry_limit} ]]; then
      echo "waiting for chaos result.."; sleep 10
      ((result_check_retry_count++))
    else
      echo "unable to find chaosresult resource"; exit 1
    fi
  fi
done
