---
hide:
  - toc
---
# Litmus Portal

## Table of Contents

1. [Can we host MongoDB outside the cluster? What connection string is supported? Is SSL connection supported?](#can-we-host-mongodb-outside-the-cluster-what-connection-string-is-supported-is-ssl-connection-supported)

1. [What does failed status of workflow means in LitmusPortal?](#what-does-failed-status-of-workflow-means-in-litmusportal)

1. [How can I setup a chaoshub of my gitlab repo in Litmus Portal?](#how-can-i-setup-a-chaoshub-of-my-gitlab-repo-in-litmus-portal)

1. [How to achieve High Availability of MongoDB and how can we add persistence to MongoDB?](#how-to-achieve-high-availability-of-mongodb-and-how-can-we-add-persistence-to-mongodb)

1. [Can I create workflows without using a dashboard?](#can-i-create-workflows-without-using-a-dashboard)

1. [Does Litmusctl support actions that are currently performed from the portal dashboard?](#does-litmusctl-support-actions-that-are-currently-performed-from-the-portal-dashboard)

1. [How is resilience score is Calculated?](#how-is-resilience-score-is-calculated)

### Can we host MongoDB outside the cluster? What connection string is supported? Is SSL connection supported? 

Yes we can host Mongodb outside the cluster, the mongo string can be updated accordingly DataBaseServer: "mongodb://mongo-service:27017"
We use the same connection string for both authentication server and graphql server containers in litmus portal-server deployment, also there are the db user and db password keys that can be tuned in the secrets like DB_USER: "admin" and DB_PASSWORD: "1234". 
We can connect with SSL if the certificate is optional. If our requirement is ca.cert auth for the SSL connection, then this is not available on the portal

### What does failed status of workflow means in LitmusPortal?

Failed status indicates that either there is some misconfiguration in the workflow or the default hypothesis of the experiment was disproved and some of the experiments in the workflow failed, In such case, the resiliency score will be less than 100.

### How can I setup a chaoshub of my gitlab repo in Litmus Portal?
  
In the litmus portal when you go to the chaoshub section and you click on connect new hub button, you can see that there are two modes of authentication i.e public mode and private mode. For public mode, you only have to provide the git URL and branch name.
For private mode, we have two types of authentication; Access token and SSH key. For the access token, go to the settings of GitLab and in the Access token section, add a token with read repository permission. After getting the token, go to the Litmus portal and provide the GitLab URL and branch name along with the access token. After submitting, your own chaos hub is connected to the Litmus portal. For the second mode of authentication i.e; SSH key, In SSH key once you click on the SSH, It will generate a public key. You have to use the public key and put it in the GitLab setting. Just go to the settings of GitLab, you can see the SSH key section, go to the SSH key section and add your public key. After adding the public key. Get the ssh type URL of the git repository and put it in the Litmusportal along with the branch, after submitting your chaoshub is connected to the Litmus Portal.

### How to achieve High Availability of MongoDB and how can we add persistence to MongoDB?

Currently, the MongoDB instance is not HA, we can install the MongoDB operator along with mongo to achieve HA. This MongoDB CRD allows for specifying the desired size and version as well as several other advanced options. Along with the MongoDB operator, we will use the MongoDB sts with PV to add persistence.

### Can I create workflows without using a dashboard?

Currently, you can’t.But We are working on it. Shortly we will publish samples for doing this via API/SDK and litmusctl.

###  Does Litmusctl support actions that are currently performed from the portal dashboard?

For now you can create agents and projects, also you can get the agents and project details by using litmusctl. To know more about litmusctl please refer to the [documentation](https://github.com/litmuschaos/litmusctl/blob/master/Usage.md) of litmusctl.

### How is resilience score is Calculated?

The Resilience score is calculated on the basis of the weightage and the Probe Success Percentage of the experiment. Resilience for one single experiment is the multiplication of the weight given to that experiment and the Probe Success Percentage. Then we get the total test result by adding the resilience score of all the experiments. The Final Resilience Score is calculated by dividing the total test result by the sum of the weights of all the experiments combined in the single workflow. For more detail refer to [this](https://dev.to/litmus-chaos/how-the-resilience-score-algorithm-works-in-litmus-1d22) blog.
