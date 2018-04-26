This directory contains the actual tests executed by Litmus. 

The tests are organized by the solution or workload. For example - all MySQL related tests can be found here ./tests/mysql directory. 

Each workload directory can have one or more directories, with each directory pointing to a certain feature that needs to be tested. Continuing with the MySQL example - there can be two tests related to MySQL resiliency against node failures and MySQL storage benchmarking tests, filed under ./tests/mysql/mysql-node-resiliency and ./tests/mysql/mysql-benchmarking. 

Each feature or test directory will contain a run_litmus.yaml, a Kubernetes Job that executes the test. 


