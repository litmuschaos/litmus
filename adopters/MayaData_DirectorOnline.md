## **MayaData**

[Director Online](https://director.mayadata.io/) is a  tool to manage and visualize the cluster more efficiently and even data migration across cloud. To manage your cluster you can connect it to the saas platform [director.mayadata.io](https://director.mayadata.io/) or you can have your own on-prem installation using DOP.
Director reduces the risk and increases the agility of running stateful applications on Kubernetes. Your workloads can have storage provisioned, backed-up, monitored, logged, managed, tested, and even migrated across clusters and clouds
 
### **Why do we use litmus**
 
We realised that functional testing alone is not sufficient to ensure the resiliency of the system. So, We planned to practice chaos engineering in our E2E test suite in order to validate the system's resiliency. We wanted to induce chaos not only specific to OpenEBS components but also on the underlying Kubernetes components which forms the skeleton for Containers infrastructure. Litmus eases our vision by providing chaos charts for the above said components. Litmus has a separate chaos category for OpenEBS charts which is evolving continuously.

### How do we use litmus

For [DO](https://director.mayadata.io/) and DOP we have commit based E2E pipeline to help developers to test their commits and integration of the different components of the director and deliver the application quickly to the user. We have incorporated various test scenarios using chaos charts provided by litmuschaos  which helped in developing our E2E test quickly and efficiently. We have covered various platforms to test and make our product more reliable and litmus has helped us in achieving that. Moreover, the learning curve to adopt litmus was also very less which motivated us to use it in our pipeline.

We are using litmus to introduce live chaos on our clusters as well to see how our application behaves in real-time and test the resiliency to make our infrastructure more efficient and reliable (Gamedays).

We have different stateful applications in our production  mysql, cassandra, postgres to name some we are using to litmus to introduce chaos to these applications and to observe the impact on our components that are using these sts.


### Benefits in using litmus

Litmus has provided a very easy way to provide scriptable, reproducible tests easy to implement and make our application more reliable and fault-tolerant.

