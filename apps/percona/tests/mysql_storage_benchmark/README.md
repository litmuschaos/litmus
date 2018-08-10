This is a sample test to illustrate/templatize how scenarios can be coded using ansible in Litmus. 

### Understanding the ansible-based litmus test

- Objective: Obtain a TPC-C benchmark against a MySQL (percona) database created on specified kubernetes storage solution

- Components: The ansible-based litmus test has the following pieces:-
  
  - The test code itself - constructed as playbooks (`test.yaml`). Most steps are simple kubectl commands. 

  - The auxiliary taskfiles invoked in the main playbook - such as `test_vars.yaml`, `test_cleanup.yaml` 

    Note: Tests may also include additional taskfile such as `test_prerequisites.yaml` 

  - Deployment/statefulset specification used in the test scenario (`mysql.yaml`). By default, this consists of a placeholder 
for the storageClass which will be replaced with the desired provider as part of test execution

  - Test kubernetes job: The actual "test artifact" which is deployed to run the litmus test (`run_litmus_test.yaml`). 
This job runs the `ansible-runner` container which executes the aforementioned test code with a `logger sidecar`. 
  
    Notes: 

    - By default, the OpenEBS storage class is passed as an ENV variable to the `ansible_runner` container. Replace with SC of
desired storage provider. However, ensure the provider is already setup on the cluster

    - Update the application node selector ENV variable to schedule the app on node with desired disk resources. In case of
local persistent volumes, ensure that the node selected also has the PV created. 

    - The test folder may also contain several `setup_*.yaml` config maps as necessary inputs to the test job

It is rcommended that the naming conventions of the test playbooks, setup config maps & test kubernetes jobs are maintained
as described above in order to aid batch runs of all the litmus tests by the executor frameworks 

### Running the test 

[Pre-Requisites](https://github.com/openebs/litmus#running-a-specific-test)

The test can be run using the following command:

`kubectl apply -f run_litmus_test.yaml` 


### Viewing test results & logs 

The test is completed upon the kubernetes job completion. at the end of which the `ansible_runner` & `logger pods` are deleted.

Currently, the test results and logs are available in the `/mnt` folder of the node in which the job is scheduled. These include
the test result, pod logs, playbook logs & node's systemd (kubelet) logs if available.


### Considerations 

All the litmus tests harness the enormous potential of `kubectl` which we believe is more than just a CLI tool



  
