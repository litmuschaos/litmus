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
import multiprocessing
import time
import argparse
import sys


def create_api():
    while True:
        try:
            v1 = client.CoreV1Api()
            break
        except Exception:
            time.sleep(30)
    return v1


def get_nodes(node_count):
    v1 = create_api()
    while True:
        try:
            getNodes = v1.list_node()
            if len(getNodes.items) == int(node_count):
                return getNodes.items
        except Exception as e:
            print e
        time.sleep(30)


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
        except Exception:
            time.sleep(30)
    print('Cluster is Up and Running')


def get_kube_config():
    while True:
        try:
            config.load_kube_config()
            break
        except Exception:
            time.sleep(30)


def get_args():
    parser = argparse.ArgumentParser()
    # Pass total node count including master node in the cluster iusing flag -n or --nodes
    parser.add_argument(
        '-n', '--nodes', help='Node or Size of cluster', required=True)
    args = parser.parse_args()
    return args.nodes


def init():
    nodes = get_args()
    get_kube_config()
    while True:
        try:
            checkCluster(nodes)
            return exit
        except Exception:
            time.sleep(30)


if __name__ == '__main__':
    p = multiprocessing.Process(target=init, name="main")
    p.start()
    timeElapsed = 0
    timeOut = 900
    while(True):
        if p.is_alive() is False:
            p.terminate()
            sys.exit(0)
        # Setting Timeout to 900 seconds
        elif timeElapsed == timeOut:
            print "Error: time out! Program terminated after", timeOut, "seconds"
            p.terminate()
            sys.exit(1)
        time.sleep(1)
        timeElapsed += 1