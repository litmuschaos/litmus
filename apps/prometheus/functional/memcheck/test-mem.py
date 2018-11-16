#------------------------------------------------------------------------------
#!/usr/bin/env python
#description     :Test to verify the memory consumed with sample workloads. 
#==============================================================================

from __future__ import division
import subprocess
import time, os, sys
list = []
target_name = sys.argv[1]
namespace = sys.argv[2]
used_mem_process = "kubectl exec %s -n %s -- pmap -x 8 | awk ''/total'/ {print $3}'" %(target_name,namespace)
n = 10
count = 0
#Obtaining memory consumed by longhorn process from the cntroller pod.
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
# A watermark of 800MB(re-calibrated based on results oberved from latest sanity run) 
# profile chosen in this test
# TODO: Identify better mem consumption strategies
if all(i <= 500 for i in list):
        print ("Pass")
else:
        print ("Fail")

