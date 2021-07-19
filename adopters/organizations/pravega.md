### **Pravega**

[Pravega](https://pravega.io/) is an open source storage system implementing **Streams** as a first-class primitive for storing/serving continuous and unbounded data. Pravega organizes data into **Streams**. A **Stream** is a durable, elastic, append-only, unbounded sequence of bytes having good performance and strong consistency.
Pravega Streams are based on an append-only log data structure. By using append-only logs, Pravega rapidly ingests data into durable storage.

### Why do we use litmus

**Pravega** is a distributed system and is deployed on our custom build of Kubernetes having the desired set of microservices, hence we were seeking a tool which can adapt in our environment with minimal alteration and be able to inject faults while exercising quality tests on our product.

Therefore, we chose Litmus Chaos to meet our use cases. The benefits we see in Litmus Chaos are: it is a CNCF project, it supports kubernetes type deployment environment, it has frequent & steady releases, and it's a well maintained tool.

### How do we use litmus

On deploying Litmus Chaos along with its **Chaos Experiments**, we get standard fault injection scenarios like: **pod-network-loss**, **pod-network-latency** & **pod-cpu-hog**, which we introduce on live deployments of a Pravega cluster. This helps us to simulate real time stressful conditions on the setup and to test for its recovery & fault-tolerance behavior, which in turn helps us to improve the overall quality of our product in stable as well as adverse conditions.