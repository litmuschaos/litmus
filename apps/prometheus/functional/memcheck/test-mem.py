#------------------------------------------------------------------------------
#!/usr/bin/env python
#==============================================================================
'''
description :Test to verify the memory consumed with sample workloads.
'''
from __future__ import division
import subprocess
import time
import argparse
import sys

def subprocess_wrapper(pid, stdout=subprocess.PIPE, shell=True):
    """ A subprocess.Popen wrapper func """
    out = subprocess.Popen(pid, stdout=stdout, shell=shell)
    return out.communicate()

def compute_mem_func(args):
    """ this func computes the memory consumption over 10 iterations and returns the result """
    namespace = args.namespace
    targetname = args.target_name
    threshold = int(args.mem_threshold)
    mem_list = []
    getpid = "kubectl exec %s -n %s -- pidof %s" %(targetname, namespace, args.process_name)
    print getpid
    pid = subprocess_wrapper(getpid)
    istgtpid = int(pid[0])
    used_mem_process = "kubectl exec %s -n %s -- pmap -x %s | awk ''/total'/ {print $3}'" \
    %(targetname, namespace, istgtpid)
    for _ in range(0, 10):
        used_mem = subprocess_wrapper(used_mem_process)
        mem_in_mb = int(float(used_mem[0]))/1024
        print (mem_in_mb), "MB"
        if mem_in_mb < threshold:
            time.sleep(20)
        else:
            print "Fail"
            sys.exit("Memory consumption > {} MB, exiting".format(threshold))
        mem_list.append(mem_in_mb)
    return mem_list

def main():
    """  this is the main function """
    parser = argparse.ArgumentParser(description="Compute the memory consumed by cstor-istgt \
    process over a period of 10 iterations")
    parser.add_argument('-t', '--target_name', required=True, help='The target pod')
    parser.add_argument('-n', '--namespace', required=True, help="The namespace where the \
    target pod is running")
    parser.add_argument('-m', '--mem_threshold', required=True, help='The mem threshold')
    parser.add_argument('-p', '--process_name', required=True, help='The process whose mem \
    consumption has to be checked')
    args = parser.parse_args()
    compute_mem_list = compute_mem_func(args)
    # A watermark of 500MB(re-calibrated based on results oberved from latest sanity run)
    # profile chosen in this test
    # TODO: Identify better mem consumption strategies
    if all(i <= int(args.mem_threshold) for i in compute_mem_list):
        print "Pass"
    else:
        print "Fail"

if __name__ == '__main__':
    main()
