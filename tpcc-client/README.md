# Running the TPC-C benchmark on mysql/percona container/pod 
-------------------------------------------------------------

## What is TPC-C benchmark 

As an OLTP system benchmark, TPC-C (Transaction Performance Council - C) simulates a complete environment where 
a population of terminal operators executes transactions against a database. The benchmark is centered around the 
principal activities (transactions) of an order-entry environment. These transactions include entering and delivering 
orders, recording payments, checking the status of orders, and monitoring the level of stock at the warehouses.

## Steps to run TPC-C benchmark

- Obtain the IP of the DB container/pod. If it is a kubernetes pod, use the kubectl desribe command

  ```
  kubectl describe pod percona | grep IP
  ```
- Note the db_user name and password for the mysql to perform the remote login 

- Pull the openebs/tests-tpcc-client docker image on the test host/kubernetes minion
  
  ```
  sudo docker pull openebs/tests-tpcc-client:latest
  ```

- Edit the tpcc.conf json file to set the right values for the benchmark attributes 

  ```
  {
  "db_user": "root",
  "db_password": "k8sDem0",
  "warehouses": "32",
  "connections": "32",
  "warmup_period": "10",
  "run_duration": "1800",
  "interval": "10"
  }
  ```
  See this document to understand what the attributes mean and how changing them impacts transaction metrics : 
  http://www.hammerdb.com/hammerdb_transactionintro.pdf

- Run the tpcc-client container with host network & bind-mounting the tpcc.conf file into the container as shown:

  ```
  sudo docker run --net host -v <path/to/tpcc.conf>:/tpcc-mysql/tpcc.conf --rm openebs/tests-tpcc-client /bin/bash -c "./tpcc-runner.sh <db_server_ip> tpcc.conf"
  ```
- View the logs for the benchmark run using the command below. Note the 

  ```
  sudo docker logs -f  <tpcc-client-containerid>
  ```
  
## License

openebs/test-storage is developed under Apache 2.0 License. Some components of the project are derived from other opensource projects
like [axboe/fio](https://github.com/axboe/fio), [percona-Lab/tpcc-mysql](https://github.com/Percona-Lab/tpcc-mysql) and are distributed under their respective licenses.
  


