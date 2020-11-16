I am Bhaumik Shah, DevOps Engineer. We are setting up Kafka Platform for our bank and was looking for a Fault Tolerance tool which can provide chaos experiments. We have explored many tools which are available in the industry like: GremlinFree, PowerfulSeal, Pumba and finally Litmus.

Litmus is far better which provides all the chaos feature for free which are available in other tools with license 
cost. I closely worked with Karthik to acheive below funcationalty for Kafka fault tolerance:

- Deploying confluent helm chart for kafka and checking brokers gets storage bound successfully
- Kill leader brokers under active load (via locust workload generator) and ensure it comes back
- Kill zookeeper pod and ensure it comes back
- Kill consumer pods (my own apps) and ensure they come back and don't miss messages
- Kill producer pods and ensure they come back and all messages get sent

Looking for more enhancements/features and user friendly UI to configure/control all chaos experiments.
I must say the team is doing great work and they are very proactive. Many congratulations to them on what 
they have achieved so far.
