# Deploying Wordpress and MySQL applicaion

## Description
   - This LitmusBook is to deploy MySQL and Wordpress application using OpenEBS PV

### run_litmus_test.yml
   - This file has the details of the environmental variables that need to deploy MySQL and Wordpress application
   - Environmental Variables used for this litmusbook is listed below:
        - PROVIDER_STORAGE_CLASS : StorageClass to deploy MySQL application
        - STORAGE_CLASS : StorageClass to deploy WordPress applicaiton
        - MYSQL_APP_PVC : PersistentVolumeClaim name for the MySQL application
        - MYSQL_PASS : Secret pass for MySQL
        - WORDPRESS_APP_PVC : PersistentVolumeClaim name for the wordpress application
        - APP_LABEL : Lable for the MySQL and Wordpress application
        - APP_NAMESPACE : Namespace for the MySQL and Wordpress to deploy
        - APP_REPLICA : Application replica count for the wordpress
        - MYSQL_PV_CAPACITY : Storage capacity for the MySQL application Persistent Volume 
        - WORDPRESS_PV_CAPACITY : Storage capacity for the Wordpress application Persistent Volume
        - PVC_ACCESS_MODE : Access Mode for the Persistent Volume Claim of Wordpress Application.

Note: If Want to deploy the application using NFS provisioner. Let's use the storage class as creatted as part of NFS provisioner deploy.  And the Access Mode for the application is supports ReadWriteMany also. 

### wordpress.yml
   - Deployment spec for the Wordpress deployment

### mysql.yml
   - Deployment spec for Mysql deployment

### test_vars.yml
   - This test_vars file has the list of variables that are used in the LitmusBook

### test.yml
   - test.yml is the actual LitmusBook where it contains the step by step ansible tasks to provision the MySQL and Wordpress application
