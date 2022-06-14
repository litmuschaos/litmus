## FIS
[FIS](https://www.fisglobal.com/) is an American multinational corporation which offers a wide range of financial products and services.

## Why do we use Litmus.  
We at FIS Global, have been embarking on to larger SRE program to transform platform teams from purely operations focused to bring in SRE/Automation culture and mindset. As part of that larger effort, Chaos/Resiliency Engineering is identified as key program to improve stability and availability thus improve overall reliability of applications across organization and provide superior customer experience. We have chosen Litmus as a Chaos Engineering Tool because, It

Fulfills all of resiliency testing requirements
Has good and responsive community
Has good documentation
is built on loosely coupled architecture
Has nice dashboard features
Exposes APIs to integrate with CI/CD pipelines

## Where we are using Litmus

Currently, using in Applications/Workloads but idea is to expand to Infrastructure, e.g. using network latency to identify and understand resiliency of upstream application/component when downstream application/component is slow, Use Pod delete under production load to understand the application's ability to self heal.
Simulate experiments using Litmus to understand utilization of JVM's key resources such as thread pool, connection pool, heap memory etc
Kafka Resiliency : Kafka itself is a complex distributed architecture solution, planning to use Litmus network and memory hog experiments to simulate latency between Producer and Broker, Consumer and Broker, Leader and Follower, and also trying to understand how cluster behaves under Memory and CPU pressure.
Integrate Litmus with CI/CD over APIs so that Chaos Testing can be autonomous

