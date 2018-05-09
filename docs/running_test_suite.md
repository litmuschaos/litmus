# Running a Complete Test Suite

The Litmus test suite can be run on a kubernetes cluster using an ansible-based executor framework. 
This involves: 

- Setting up ansible on any linux machine (ansible test harness), with SSH access to the kubernetes cluster 
- Generating the ansible inventory file with host information (master/control node & hosts)
- Modifying a global variables file to:
   
  - Set Provider and storage class
  - Select test Category (call or subset)
  - Enable/Disable some services like log collection, notifications etc..,

Follow the executor/README for detailed instructions on how to perform above steps. Once these pre-requisites 
have been met, execute the following on the ansible test harness:

```
./litmus/executor/ansible/run-litmus.sh
```

The above script will verify that it has all the details required for it to proceed and provides you with 
test task execution status. 

*Litmus may take a while to show a reaction as it puts the system through rigorous scrutiny!*
