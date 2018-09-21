# liveness check #
import socket
import sys
import time
import os

# Assigning the environment variables
port = os.environ['PORT']
ns = os.environ['NAMESPACE']
sv = os.environ['SERVICE']
sleep = os.environ['SLEEP']

def isOpen(ip,port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
       s.connect((ip, int(port)))
       s.shutdown(2)
       return True
    except:
       return False
  
if __name__ == '__main__':
    url = sv+"."+ns+"."+"svc.cluster.local"
    ip= url
    port=int(port)
    while True:    
        res=isOpen(ip,port)
        if res==True:
            print ("Liveness Running")
            sys.stdout.flush()
        else:
            print("Liveness Failing")
            sys.stdout.flush()
        time.sleep(int(sleep))
