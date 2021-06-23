## VMware

[VMware, Inc](https://www.vmware.com/in.html) is a cloud computing and virtualization technology company.

### **Why was Litmus chosen**

In EUC (End-user computing), we are transforming to SaaS.  And resilience is key to the product success.  After searching the chaos engineering tools, we decided to use litmus for below reasons: 

* It has fast release and is well maintained.
* It is a CNCF project.
* It is kubernetes friendly.


### **How do we use Litmus**

After the the services pass integration testing, the builds are refreshed to the Chaos Stack.  Litmus is used to inject chaos to this environment in order to make sure the services can still pass the integration test cases.
