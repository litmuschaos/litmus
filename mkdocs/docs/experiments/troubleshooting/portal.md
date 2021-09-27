---
hide:
  - toc
---
# Litmus Portal

## Table of Contents

1. [We were setting up a Litmus Portal, however, Self-Agent status is showing pending. Any idea why is happening?](#we-were-setting-up-a-litmus-portal-however-self-agent-status-is-showing-pending-any-idea-why-is-happening)

1. [After logging in for the first time to the portal, /get-started page kept loading after I provided the new password](#after-logging-in-for-the-first-time-to-the-portal-get-started-page-kept-loading-after-i-provided-the-new-password)

1. [Subscriber is crashing with the error dial:websocket: bad handshake](#subscriber-is-crashing-with-the-error-dialwebsocket-bad-handshake)

1. [Not able to connect to the LitmusChaos Control Plane hosted on GKE cluster](#not-able-to-connect-to-the-litmuschaos-control-plane-hosted-on-gke-cluster)

1. [I forgot my Litmus portal password. How can I reset my credentials?](#i-forgot-my-litmus-portal-password-how-can-i-reset-my-credentials)

1. [While Uninstalling Litmus portal using helm, some components like subscriber, exporter, event, workflows, etc, are not removed](#while-uninstalling-litmus-portal-using-helm-some-components-like-subscriber-exporter-event-workflows-etc-are-not-removed)

1. [Unable to Install Litmus portal using helm. Server pod and mongo pod are in CrashLoopBackOff state. Got this error while checking the logs of mongo container chown: changing ownership of '/data/db/.snapshot': Read-only file system](#unable-to-install-litmus-portal-using-helm-server-pod-and-mongo-pod-are-in-crashloopbackoff-state-got-this-error-while-checking-the-logs-of-mongo-container-chown-changing-ownership-of-datadbsnapshot-read-only-file-system)

1. [Pre-defined workflow Bank Of Anthos showing bus error for accounts-db or ledger-db pod?](#pre-defined-workflow-bank-of-anthos-showing-bus-error-for-accounts-db-or-ledger-db-pod)

### We were setting up a Litmus Portal, however, Self-Agent status is showing pending. Any idea why is happening?

The litmusportal-server-service might not be reachable due to inbound rules. You can enable the traffic to it if on GKE/EKS/AKS (by adding the port to inbound rules for traffic). You have to check the logs of the subscriber pod and expose the port mentioned for communication with the server.

### After logging in for the first time to the portal, /get-started page kept loading after I provided the new password.

First, try to clear the browser cache and cookies and refresh the page, this might solve your problem. If your problem persists then delete all the cluster role bindings,PV, and PVC used by litmus and try to reinstall the litmus again.

### Subscriber is crashing with the error dial:websocket: bad handshake

It is a network issue. It seems your subscriber is unable to access the server. While installing the agent, It creates a config called agent-config to store some metadata like server endpoint, accesskey, etc. That server endpoint can be generated in many ways:
  
  - Ingress (If INGRESS=true in server deployment envs)
  - Loadbalancer (it generates lb type of IP based on the server svc type)
  - NodePort (it generates nodeport type of IP based on the server svc type)
  - ClusterIP (it generates clusterip type of IP based on the server svc type)

So, you can edit the agent-config and update the node IP. Once edited, restart the subscriber. We suggest using ingress, so that if the endpoint IP changes, then it won't affect your agent.

### Not able to connect to the LitmusChaos Control Plane hosted on GKE cluster.

In GKE you have to setup a firewall rule to allow TCP traffic on the node port.You can use the following command:
gcloud compute firewall-rules create test-node-port --allow tcp:port
If this firewall rule is set up, it may be accessible on nodeIp:port where nodeIp is the external IP address of your node.

### I forgot my Litmus portal password. How can I reset my credentials?

You can reset by running the followin command:
```
kubectl exec -it mongo-0 -n litmus -- mongo -u admin -p 1234 <<< $'use auth\ndb.usercredentials.update({username:"admin"},{$set:{password:"$2a$15$sNuQl9y/Ok92N19UORcro.3wulEyFi0FfJrnN/akOQe3uxTZAzQ0C"}})\nexit\n'
```
Make sure to update the namespace and mongo pod name according to your setup,the rest should remain the same. This command will update the password to litmus.

### While Uninstalling Litmus portal using helm, some components like subscriber, exporter, event, workflows, etc, are not removed.

These are agent components, which are launched by the control plane server, so first disconnect the agent from the portal then uninstall the portal using helm.

### Unable to Install Litmus portal using helm. Server pod and mongo pod are in CrashLoopBackOff state. Got this error while checking the logs of mongo container chown: changing ownership of '/data/db/.snapshot': Read-only file system

It seems the directory somehow existed before litmus installation and might be used by some other application. You have to change the mount path from /consul/config to /consul/myconfig in mongo statefulset then you can successfully deploy the litmus.

### Pre-defined workflow Bank Of Anthos showing bus error for accounts-db or ledger-db pod?

Bank of anthos is using PostgreSQL and wouldn't fall back properly to not using huge pages. 
With given possible solution if same scenario occur can be resolve.

 - Modify the docker image to be able to set huge_pages = off in /usr/share/postgresql/postgresql.conf.sample before initdb was ran (this is what I did).
 - Turn off huge page support on the system (vm.nr_hugepages = 0 in /etc/sysctl.conf).
 - Fix Postgres's fallback mechanism when huge_pages = try is set (the default).
 - Modify the k8s manifest to enable huge page support (https://kubernetes.io/docs/tasks/manage-hugepages/scheduling-hugepages/).
 - Modify k8s to show that huge pages are not supported on the system, when they are not enabled for a specific container.
 