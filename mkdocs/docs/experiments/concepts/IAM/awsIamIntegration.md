# IAM integration for Litmus service accounts

You can execute Litmus AWS experiments to target different AWS services from the EKS cluster itself, for this we need to authenticate Litmus with the AWS platform, we can do this in two different ways:

<ul>
<li> <b>Using secrets:</b> It is one of the common ways to authenticate litmus with AWS irrespective of the Kubernetes cluster used for the deployment. In other words, it is Kubernetes’ native way for the authentication of litmus with the AWS platform. </li>
<li> <b>IAM Integration:</b> It can be used when we’ve deployed Litmus on <code>EKS cluster</code>, we can associate an IAM role with a Kubernetes service account. This service account can then provide AWS permissions to the experiment pod that uses that service account. We’ll discuss more this method in the below sections.</li>
</ul>

## Why should we use IAM integration for AWS authentication?

The IAM roles for service accounts feature provides the following benefits:

<ul>
<li> <b>Least privilege:</b> By using the IAM roles for service accounts feature, you no longer need to provide extended permissions to the node IAM role so that pods on that node can call AWS APIs. You can scope IAM permissions to a service account, and only pods that use that service account have access to those permissions.</li>
<li> <b>Credential isolation:</b> The experiment can only retrieve credentials for the IAM role that is associated with the service account to which it belongs. The experiment never has access to credentials that are intended for another experiment that belongs to another pod.</li>
</ul>

## Enable service accounts to access AWS resources:

#### Step 1: Create an IAM OIDC provider for your cluster

We need to perform this once for a cluster. We’re going to follow the [AWS documentation to setup an OIDC provider](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) with eksctl.


**Check whether you have an existing IAM OIDC provider for your cluster:** To check this you can follow the given instruction.

***Note:*** _For demonstration we’ll be using cluster name as litmus-demo and region us-west-1 you can replace these values according to your ENV._

```bash
aws eks describe-cluster --name <litmus-demo> --query "cluster.identity.oidc.issuer" --output text
```
**Output:**

```bash
https://oidc.eks.us-west-1.amazonaws.com/id/D054E55B6947B1A7B3F200297789662C
```

Now list the IAM OIDC providers in your account.

<i>Command:</i>

```bash
aws iam list-open-id-connect-providers | grep <EXAMPLED539D4633E53DE1B716D3041E>
```

Replace `<D054E55B6947B1A7B3F200297789662C>` (including `<>`) with the value returned from the previous command.

So now here we don’t have an IAM OIDC identity provider, So we need to create it for your cluster with the following command. Replace `<litmus-demo>` (`including <>`) with your own value.

```bash
eksctl utils associate-iam-oidc-provider --cluster litmus-demo --approve
2021-09-07 14:54:01 [ℹ]  eksctl version 0.52.0
2021-09-07 14:54:01 [ℹ]  using region us-west-1
2021-09-07 14:54:04 [ℹ]  will create IAM Open ID Connect provider for cluster "udit-cluster-11" in "us-west-1"
2021-09-07 14:54:05 [✔]  created IAM Open ID Connect provider for cluster "litmus-demo" in "us-west-1"
```

#### Step 2: Creating an IAM role and policy for your service account 

You must create an IAM policy that specifies the permissions that you would like the experiment should to have. You have several ways to create a new IAM permission policy. Check out the [AWS docs for creating the IAM policy](https://docs.aws.amazon.com/eks/latest/userguide/create-service-account-iam-policy-and-role.html#create-service-account-iam-policy). We will make use of eksctl command to setup the same.

```bash
eksctl create iamserviceaccount \
--name <service_account_name> \
--namespace <service_account_namespace> \
--cluster <cluster_name> \
--attach-policy-arn <IAM_policy_ARN> \
--approve \
--override-existing-serviceaccounts
```

#### Step 3: Associate an IAM role with a service account

Complete this task for each Kubernetes service account that needs access to AWS resources. We can do this by defining the IAM role to associate with a service account in your cluster by adding the following annotation to the service account.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<ACCOUNT_ID>:role/<IAM_ROLE_NAME>
```

You can also annotate the experiment service account running the following command.

***Notes:***   
_1. Ideally, annotating the `litmus-admin` service account in `litmus` namespace should work for most of the experiments._   
_2. For the cluster autoscaler experiment, annotate the service account in the `kube-system` namespace._


```bash
kubectl annotate serviceaccount -n <SERVICE_ACCOUNT_NAMESPACE> <SERVICE_ACCOUNT_NAME> \
eks.amazonaws.com/role-arn=arn:aws:iam::<ACCOUNT_ID>:role/<IAM_ROLE_NAME>
```

Verify that the experiment service account is now associated with the IAM.

If you run an experiment and describe one of the pods, you can verify that the `AWS_WEB_IDENTITY_TOKEN_FILE` and `AWS_ROLE_ARN` environment variables exist.

```bash
kubectl exec -n litmus <ec2-terminate-by-id-z4zdf> env | grep AWS
```
Output:
```
AWS_VPC_K8S_CNI_LOGLEVEL=DEBUG
AWS_ROLE_ARN=arn:aws:iam::<ACCOUNT_ID>:role/<IAM_ROLE_NAME>
AWS_WEB_IDENTITY_TOKEN_FILE=/var/run/secrets/eks.amazonaws.com/serviceaccount/token
```

Now we have successfully enabled the experiment service accounts to access AWS resources.

## Configure the Experiment CR.

Since we have already configured the IAM for the experiment service account we don’t need to create secret and mount it with experiment CR which is enabled by default. To remove the secret mount we have to remove the following lines from experiment YAML. 

```yaml
secrets:
- name: cloud-secret
    mountPath: /tmp/
```
We can now run the experiment with the direct IAM integration.