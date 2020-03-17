I am Bhaumik Shah, DevOps Engineer working in one of the TOP banks in Australia.We are setting up Kafka Platform 
for our bank and was looking for a Fault Tolerance tool which can provide a chaos experiments. We have explored 
many tools which are available in the industry like : GremlinFree, PowerfulSeal, Pumba and finally Litmus.

Litmus is far better which provides all the chaos feature for free which are avaible in other tools with license 
cost. I closely worked with Karthik to achive below set of funcationalty for Kafka fault tolerance:

- Deploying confluent helm chart for kafka and checking brokers gets Storage bound successfully
- Kill broker under active load via locust workload generator and ensure it comes back
- Kill zookeeper pod and ensure it comes back
- Kill consumer pods (my own apps) and ensure they come a back and doesn't miss message
  Kill producer pod and ensure it comes back and ensure all messages get sent.

Looking for more enancements/features and user friendly UI to configure/control all chaos experiments.
I must say the team is doing great work and they are very proactive. Many congrtulation to them on what they have 
achived so far.
