from pymongo import MongoClient
import time
import os
from pprint import pprint
import sys

# Assigning the environment variables

i_w_d = os.environ['INIT_WAIT_DELAY']   # Time period (in sec) b/w retries for DB init check
i_r_c=os.environ['INIT_RETRY_COUNT']      # No of retries for DB init check
l_p_s=os.environ['LIVENESS_PERIOD_SECONDS'] # Time period (in sec) b/w liveness checks
l_t_s=os.environ['LIVENESS_TIMEOUT_SECONDS']  # Time period (in sec) b/w retries for db_connect failure
l_r_c=os.environ['LIVENESS_RETRY_COUNT']     # No of retries after a db_connect failure before declaring liveness fail
 


# client = MongoClient("mongodb://127.0.0.1:27017/mydb")
client = MongoClient("mongodb://mongo.litmus.svc.cluster.local/mydb")
db=client.admin

# function for db_init check
def db_init_check():
    try:
        connections_dict = db.command("serverStatus")["connections"]
        pprint(connections_dict)
        sys.stdout.flush()
        return 1
    except Exception as e:
        print("connection lost",flush=True)
        # sys.stdout.flush()
        return 0

#checking the database status
for i in range(1,int(i_r_c)):
    x=db_init_check()
    if x==0:
        db_init_check
        print("fail",flush=True)
        # sys.stdout.flush()
    else:
        print("pass", x,flush=True)
        # sys.stdout.flush()
        break
    time.sleep(int(i_w_d))

#liveness check
while True:
    try:
        serverStatusResult=db.command("serverStatus")
        print("liveness Running",flush=True)
        # sys.stdout.flush()
    except Exception as e:
        print("liveness Failed", e,flush=True)
        # sys.stdout.flush()
        for y in range(1,int(l_r_c)):
            z=db_init_check()
            if z==1:
                break
            time.sleep(int(l_t_s))
        if z==0:
            break   
    time.sleep(int(l_p_s))