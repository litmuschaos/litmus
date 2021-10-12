CNF Test Suite
---

The [CNF Test Suite](https://github.com/cncf/cnf-testsuite) is an open source test suite for Cloud Native Network Function (CNF) developers and network operators to evaluate how well a telecom service (a platform or network application, aka CNF) follows cloud native principles and best practices, like resilience.

## Why do we use Litmus  
Subjecting the telecom services to chaos testing is useful in finding failure points and suggesting remediation steps toward improving resilience. Therefore, we chose LitmusChaos to create resilience tests in the CNF Test Suite. 

## How do we use Litmus  
By including LitmusChaos experiments in the CNF Test Suite's workload tests, we are able to run telecom services in resilience experiments including: **pod-network-duplication**, **pod-network-corruption**, **pod-io-stress**, **pod-memory-hog**, **pod-delete**, **disk-fill**, **pod-network-latency**, and more. This helps the end user see how their service behaves when exposed to common application failures.

## Benefits in using Litmus   
The benefits we see in LitmusChaos are: it is part of the CNCF ecosystem, it is designed for Kubernetes workloads, it has a vibrant community and it is well maintained.
