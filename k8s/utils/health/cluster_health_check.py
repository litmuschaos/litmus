# Copyright 2018 The OpenEBS Authors

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#     http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License
#
# Info:
# This Python script can be used to check the cluster readiness over multiple Clouds
# providers like GCE, GKE and AWS with any number of nodes. Script does a series of 
# api calls to the kubernetes cluster, by utilising the Python client library for kubernetes.
# Script terminates successfully once cluster is up or else fails after a T/O period of 900 seconds
# To run the script: `python cluster_health_check.py --nodes 4`

from kubernetes import client, config
import time
import argparse
import signal
import sys

def timeout_handler(x,y):
    raise Exception('timeout')

def create_api():
    while True:
        try:
            v1=client.CoreV1Api()
            break
        except Exception as e:
            print "error occurred while creating core v1 api:", e
            if e == 'timeout':
                sys.exit(1)                
            time.sleep(5)
    return v1

def get_nodes(node_count):
    v1 = create_api()
    while True:
        try:
            getNodes = v1.list_node()
            if len(getNodes.items) == int(node_count):
                return getNodes.items
        except Exception as e:
            print "error occured while getting nodes:", e
            if e == 'timeout':
                sys.exit(1)
            time.sleep(5)

def get_node_status(node_count):
    count = 0
    nodes = get_nodes(node_count)
    for node in nodes:
        obj = node.status.conditions
        for i in obj:
            if i.type == 'Ready':
                count = count + 1
    return count

def checkCluster(node_count):
    while True:
        try:
            count = get_node_status(node_count)
            if count == int(node_count):
                break
        except Exception as e:
            print 'error occured while itirating over status object:', e
            if e == 'timeout':
                sys.exit(1)
            time.sleep(5)
    print('Cluster is Up and Running')

def get_kube_config():
    while True:
        try:
            config.load_kube_config()
            break
        except Exception as e:
            print "kubeconfig not loaded.\n",e, "retrying..."
            if e == 'timeout':
                sys.exit(1)
            time.sleep(5)

def get_args():
    parser = argparse.ArgumentParser()
    # Pass total node count including master node in the cluster iusing flag -n or --nodes
    parser.add_argument('-n', '--nodes', help='Node or Size of cluster', required=True)
    args = parser.parse_args()
    return args.nodes

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(900)
if __name__ == '__main__':
    nodes = get_args()
    get_kube_config()
    while True:
        try:
            checkCluster(nodes)
            break
        except Exception as e:
            print "Error Occured:", e
            if e == 'timeout':
                sys.exit(5)
            time.sleep(5)