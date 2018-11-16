#------------------------------------------------------------------------------
#!/usr/bin/env python
#description     :Test to verify the memory consumed with sample workloads. 
#==============================================================================

from __future__ import division
import subprocess
import time, os, sys
list = []
targetname = sys.argv[1]
namespace = sys.argv[2]
getpid = "kubectl exec %s -n %s -- pidof /usr/local/bin/istgt" %(targetname,namespace)
print (getpid)
out = subprocess.Popen(getpid,stdout=subprocess.PIPE,shell=True)
pid = out.communicate()
istgtpid = int(pid[0])
used_mem_process = "kubectl exec %s -n %s -- pmap -x %s | awk ''/total'/ {print $3}'" %(targetname,namespace,istgtpid)
n = 10
count = 0
#Obtaining memory consumed by cstor-istgt process from the target pod.
while count < n:
    count = count + 1
    out = subprocess.Popen(used_mem_process,stdout=subprocess.PIPE,shell=True)
    used_mem = out.communicate()
    mem_in_mb = int(float(used_mem[0]))/1024
    print (mem_in_mb), "MB"
    if mem_in_mb < 500:
        time.sleep(20)
    else:
        print ("Fail")
        #break
        quit()
    list.append(mem_in_mb)
print (list)
# A watermark of 500MB(re-calibrated based on results oberved from latest sanity run) 
# profile chosen in this test
# TODO: Identify better mem consumption strategies
if all(i <= 500 for i in list):
        print ("Pass")
else:
        print ("Fail")

