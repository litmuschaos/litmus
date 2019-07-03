# LitmusBook to deploy the NFS Provisioner

## Description
   - This LitmusBook is to deploy the NFS provisioner using OpenEBS PV

### run_litmus_test.yml
   - This file has the details of the environmental variables that need to deploy nfs provisioner
   - Environmental Variables used for this litmusbook is listed below:
        - PROVIDER_STORAGE_CLASS : StorageClass to deploy the NFS provisioner as deployment
        - APP_PVC: PersistentVolumeClaim name for the deployment
        - APP_LABEL: Label for the NFS Provisioner
        - APP_NAMESPACE: Namespace for the NFS provisioner to deploy
        - PV_CAPACITY: PersistentVolume capacity for the NFS provisioner
        - NFS_STORAGE_CLASS_NAME: Storage class name for the NFS provisioner
        - NFS_VERSION: NFS storage class mount Version

### nfs-deployment.yml
   - Deployment spec for the NFS provisioner

### test_vars.yml
   - This test_vars file has the list of variables that are used in the LitmusBook

### test.yml
   - test.yml is the actual LitmusBook where it contains the step by step ansible tasks to provision the NFS
