## WeScale

[WeScale](https://www.wescale.fr) is a tech consulting company, Cloud pureplayer, specialised in DevOps and digital automation. We are a multi-services provider able to help companies in their Cloud projects by understanding their needs and goals.
Our goal consists in helping firms in their digital transformation process. 
We also help them to improve their knowledge such as Chaos Engineering and their skills on digital tools and software.
We provide our clients with the knowledge and competencies necessary to manage cloud computing projects and provide more resiliency to their deployed micro-services. We aim to speed up innovation, this is the main reason why WeScale exists. Thus, we lean on public cloud platforms such as AWS and GCP for instance.

### **Why do we use litmus**


To enhance the resiliency of our clients' systems, we do chaos engineering.
But, we have faced so many tools that can be used to inject chaos in our deployed micro-services.After trying many tools, Litmus took the lead when injecting chaos in kubernetes.

### How do we use litmus

We use litmus experiments available in the litmus chaos hub. We are injecting them through our CI(it depends on the CI tools uesed by our clients) in the application.
The chaos injection is done by increasing the blast radius from pods to the cluster.
Soon, we will test the Litmus Portal to manage the chaos workflow.


### Benefits in using litmus

Litmus is one of the best Open Source tools that makes doing chaos engineering  very easy. It provides a hub for chaos expriments. It can also be deployed in our kubernetes cluster without any external dependencies.
