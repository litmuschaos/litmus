# LitmusBook to deploy the OpenEBS CSI Driver.

## Description
   - This LitmusBook is capable of setting up OpenEBS CSI Driver and create a storageclass.

   - This test constitutes the below files. 

### run_litmus_test.yml
   - This includes the litmus job which triggers the test execution. The pod includes several environmental variables such as 
        - PROVIDER_STORAGE_CLASS : The name of storageclass using csi provisioner
        - REPLICA_COUNT : The number of volume replicas to be created.
        - NODE_OS : The operating system of worker nodes.
        - SPC : The SPC to be used by storage class.

### csi-cstor-sc.j2
   - The storage class template which has to be populated with the given variables

### test_vars.yml
   - This test_vars file has the list of test specific variables used in LitmusBook

### test.yml
   - test.yml is the playbook where the test logic is built to deploy OpenEBS CSI Driver and create stoarge class.
