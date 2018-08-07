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