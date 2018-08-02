from kubernetes import client, config
import time
import argparse
import signal
import sys

def timeout_handler(x,y):
    raise Exception('timeout')

def get_nodes(node_count):
    while True:
        try:
            v1=client.CoreV1Api()
            break
        except Exception as e:
            print "error occurred while creating core v1 api:", e
            if e == 'timeout':
                sys.exit(1)                
            time.sleep(5)

    while True:
        try:
            getNodes = v1.list_node()
            if len(getNodes.items) == int(node_count) + 1:
                return getNodes.items
        except Exception as e:
            print "error occured while getting nodes:", e
            if e == 'timeout':
                sys.exit(1)
            time.sleep(5)

def checkCluster(node_count):
    while True:
        try:
            count = 0
            nodes = get_nodes(node_count)
            for node in nodes:
                obj = node.status.conditions
                for i in obj:
                    if i.type == 'Ready':
                        count = count + 1

            if count == int(node_count) + 1: # +1 master node
                break
        except Exception as e:
            print 'error occured while itirating over status object:', e
            if e == 'timeout':
                sys.exit(1)
            time.sleep(5)

    print('Cluster is Up and Running')
signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(900)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-n', '--nodes', help='Node or Size of cluster', required=True)
    args = parser.parse_args()
    while True:
        try:
            config.load_kube_config()
            break
        except Exception as e:
            print "kubeconfig not loaded.\n",e, "retrying..."
            if e == 'timeout':
                sys.exit(1)
            time.sleep(5)
    while True:
        try:
            checkCluster(args.nodes)
            break
        except Exception as e:
            print "Error Occured:", e
            if e == 'timeout':
                sys.exit(5)
            time.sleep(5)