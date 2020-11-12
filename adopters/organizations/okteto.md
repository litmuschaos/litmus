## Okteto

[Okteto](https://okteto.com) is a development platform for Cloud Native applications, built to help teams get to production faster and more confidently.  Okteto allows development teams to: 

- Deploy pre-configured development and test environments with one click.
- Stop running *docker-compose up* on every machine.
- Quickly onboard new developers.
- Eliminate integration issues by developing the same way applications run in production.
- Get self-service access to their Kubernetes infrastructure.

### **Why do we use litmus**

When building Okteto Cloud and Okteto Enterprise, we realized that just testing things end to end wasn't enough.  As our user base started to grow, we realized that the resiliency of our systems was as important as it being easy to use. 

We started by inducing chaos in our microservices, to ensure that they all survived restarts, and that we didn't have any single points of failure. Now we are evolving towards simulating more complex failures, spanning not only our services, but also the underlying Kubernetes infrastructure.

### How do we use litmus

We use Litmus as part of our release testing criteria. We'll deploy the new version of our application, and run integration testing while inducing chaos. 

In the future, we are planning on using litmus to also simulate failures in the Kubernetes API and cluster failures.

### Benefits in using litmus

Litmus makes it easier to give every engineer in our organization the tools to chaos test. By integrating it directly in our catalog, we can also make that flow available to everyone else. More information on this [is available here](https://okteto.com/blog/chaos-engineering-with-litmus/).
