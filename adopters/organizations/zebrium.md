## Zebrium

Zebrium is a new [Autonomous Monitoring Solution](https://www.zebrium.com/blog/the-future-of-monitoring-is-autonomous?utm_campaign=Chaos&utm_source=litmus&utm_medium=github) that uses Machine Learning to detect incidents and their root cause in your environments completely unsupervised. This means instead of you having to configure lists of alert rules to tell your monitoring solution what to look for, you just send your logs, metrics and (in future) traces to Zebrium, and Zebrium will alert you to incidents and their root cause with no configuration in real-time!

Because our environments are getting more complex with Cloud, Containers/Kubernetes and Microservices, this provides a more scalable approach to catching issues than having to invest time and effort into setting up and maintaining long lists of alert rules. It also alerts you to failure modes you weren't aware of, and also significantly reduces Mean-Time-To-Resolution searching through your logs for the root cause!

### **Why do we use litmus**

After Maya Data used Litmus themselves to evaluate the effectiveness of Zebrium's machine learning approach on their own Kubernetes environments with a 100% detection rate, we thought it would be a great idea to use Litmus ourselves for our own testing and also to provide a demo/trial environment that new users could spin up and try out quickly to test Zebrium's solution themselves.

You can read full details here: [https://www.zebrium.com/blog/using-autonomous-monitoring-with-litmus-chaos-engine-on-kubernetes](https://www.zebrium.com/blog/using-autonomous-monitoring-with-litmus-chaos-engine-on-kubernetes?utm_campaign=Chaos&utm_source=litmus&utm_medium=github)

### How do we use litmus

We have created an [open-source Github repository](https://github.com/zebrium/zebrium-kubernetes-demo) that contains scripts and Litmus experiment configurations to quickly spin up and deploy applications to a GKE cluster, and then execute Litmus Chaos Tests, using a couple of commands. This enables us to provide a fully reproducable environment for testing the Zebrium solution.

When used with Zebrium, each experiment will create a new alert with an incident and show the correct root cause, making it easy to see the logs and what was impacted during the Litmus experiment. This is completely unsupervised using only Machine Learning, and can also be applied to other clusters running Litmus to help understand the impact of experiments running in your Kubernetes environment.

### Benefits in using litmus

Because Litmus can be deployed in-cluster, without any external dependencies, and all experiments can be scripted and managed in source control, Litmus has provided a very easy way to provide a scriptable, reproducable test of Zebrium's machine learning solution.

Please [sign up for free](https://www.zebrium.com?utm_campaign=Chaos&utm_source=litmus&utm_medium=github) at Zebrium to test it for yourself.
