#!/usr/bin/python
import psycopg2
import time
import os
import sys
import pprint
# Assigning the environment variables
ns=os.environ["NAMESPACE"] 
sv=os.environ["SERVICE_NAME"] 
user=os.environ["USER"]
db=os.environ["DATABASE"]
password=os.environ["PASSWORD"]

def connect():
    """ Connect to the PostgreSQL database server """
    conn = None
    try:
        # connect to the PostgreSQL server
        print('Connecting to the PostgreSQL database...')
        url = ""+sv+"."+ns+"."+"svc.cluster.local"
        conn = psycopg2.connect(host=url, database=db, port="5432", user=user, password=password)
        # create a cursor
        cur = conn.cursor()
        
        # execute a statement
        cur.execute('SELECT version()')
 
        # display the PostgreSQL database server version
        db_version = cur.fetchone()
        # close the communication with the PostgreSQL
        cur.close()
        return 1
    except (Exception, psycopg2.DatabaseError) as error:
        print('Liveness Failed')
        return 0
    finally:
        if conn is not None:
            conn.close()

#checking the database status
def database_check():
    for i in range(1,int(10)):
        x=connect()
        if x==0:
            connect()
            print("fail", error,flush=True)
        else:
            print("pass", x,flush=True)
            break
        time.sleep(int(30))

def retry_connection():
    for y in range(1,int(6)):
       z=connect()
       if z==1:
           return z
       time.sleep(int(10))
    if z==0:
        return z

def liveness_check():
    while True:
        try:
            url = ""+sv+"."+ns+"."+"svc.cluster.local"
            conn = psycopg2.connect(host=url, database=db, port="5432", user=user, password=password)
            # create a cursor
            cur = conn.cursor()
            print("liveness Running",flush=True)
            # sys.stdout.flush()
        except Exception as error:
            print("liveness Failed" ,flush=True)
            # sys.stdout.flush()
            z=retry_connection()
            if z==0:
                break   
        time.sleep(int(10))

if __name__ == '__main__':
    database_check()
    liveness_check()
