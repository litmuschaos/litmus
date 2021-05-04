# Kitopi
[Kitopi](https://www.kitopi.com) is world's leading managed cloud kitchen platform. 

## Why do we use Litmus.  
We started out using Litmus when searching for chaos testing tool, to continuously test our resiliency. It turned out to be really easy to implement and intuitive to use. 

## How do we use Litmus.  
On our stage environment we run nightly pipelines consisting of:
- Traffic source (Locust.io performance tests)
- Litmus Chaos experiments
- Results evaluation using Keptn
Which provide us with the information about 

## Benefits in using Litmus.   
Litmus let's us easily incorporate simple chaos experiments into already existing clusters. Since it provides native Kubernetes support, it's easy to understand and modify. Also, LitmusChaos community is nothing short of exceptional, so that's a bonus!
