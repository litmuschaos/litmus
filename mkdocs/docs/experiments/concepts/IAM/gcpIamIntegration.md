# IAM integration for Litmus service accounts

To execute LitmusChaos GCP experiments, one needs to authenticate with the GCP by means of a service account before trying to access the target resources. Usually, you have only one way of providing the service account credentials to the experiment, using a service account key, but if you're using a GKE cluster you have a keyless medium of authentication as well. 

Therefore you have two ways of providing the service account credentials to your GKE cluster:

- **Using Secrets**: As you would normally do, you can create a secret containing the GCP service account in your GKE cluster, which gets utilized by the experiment for authentication to access your GCP resources.

- **IAM Integration**: When you're using a GKE cluster, you can bind a GCP service account to a Kubernetes service account as an IAM policy, which can be then used by the experiment for keyless authentication using [GCP Workload Identity](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity). We’ll discuss more on this method in the following sections.

## Why use IAM integration for GCP authentication?
A Google API request can be made using a GCP IAM service account, which is an identity that an application uses to make calls to Google APIs. You might create individual IAM service accounts for each application as an application developer, then download and save the keys as a Kubernetes secret that you manually rotate. Not only is this a time-consuming process, but service account keys only last ten years (or until you manually rotate them). An unaccounted-for key could give an attacker extended access in the event of a breach or compromise. Using service account keys as secrets is not an optimal way of authenticating GKE workloads due to this potential blind spot and the management cost of key inventory and rotation.

Workload Identity allows you to restrict the possible "blast radius" of a breach or compromise while enforcing the principle of least privilege across your environment. It accomplishes this by automating workload authentication best practices, eliminating the need for workarounds, and making it simple to implement recommended security best practices.

- Your tasks will only have the permissions they require to fulfil their role with the principle of least privilege. It minimizes the breadth of a potential compromise by not granting broad permissions.

- Unlike the 10-year lifetime service account keys, credentials supplied to the Workload Identity are only valid for a short time, decreasing the blast radius in the case of a compromise.

- The risk of unintentional disclosure of credentials due to a human mistake is greatly reduced because Google controls the namespace service account credentials for you. It also eliminates the need for you to manually rotate these credentials.
  
## How to enable service accounts to access GCP resources?
We will be following the steps from the [GCP Documentation for Workload Identity](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity)

### STEP 1: Enable Workload Identity
You can enable Workload Identity on clusters and node pools using the Google Cloud CLI or the Google Cloud Console. Workload Identity **must** be enabled at the cluster level before you can enable Workload Identity on node pools.

Workload Identity can be enabled for an existing cluster as well as a new cluster. To enable Workload Identity on a new cluster, run the following command:
```
gcloud container clusters create CLUSTER_NAME \
    --region=COMPUTE_REGION \
    --workload-pool=PROJECT_ID.svc.id.goog
```
Replace the following:
- **CLUSTER_NAME**: the name of your new cluster.
- **COMPUTE_REGION**: the Compute Engine region of your cluster. For zonal clusters, use --zone=COMPUTE_ZONE.
- **PROJECT_ID**: your Google Cloud project ID.

You can enable Workload Identity on an existing Standard cluster by using the gcloud CLI or the Cloud Console. Existing node pools are unaffected, but any new node pools in the cluster use Workload Identity. To enable Workload Identity on an existing cluster, run the following command:

```
gcloud container clusters update CLUSTER_NAME \
    --region=COMPUTE_REGION \
    --workload-pool=PROJECT_ID.svc.id.goog
```
Replace the following:
- **CLUSTER_NAME**: the name of your new cluster.
- **COMPUTE_REGION**: the Compute Engine region of your cluster. For zonal clusters, use --zone=COMPUTE_ZONE.
- **PROJECT_ID**: your Google Cloud project ID.

### STEP 2: Configure LitmusChaos to use Workload Identity
Assuming that you already have LitmusChaos installed in your GKE cluster as well as the Kubernetes service account you want to use for your GCP experiments, execute the following steps.

1. Get Credentials for your cluster.
```
gcloud container clusters get-credentials CLUSTER_NAME
```
Replace **CLUSTER_NAME** with the name of your cluster that has Workload Identity enabled.

2. Create an IAM service account for your application or use an existing IAM service account instead. You can use any IAM service account in any project in your organization. For Config Connector, apply the `IAMServiceAccount` object for your selected service account. To create a new IAM service account using the gcloud CLI, run the following command:
```
gcloud iam service-accounts create GSA_NAME \
    --project=GSA_PROJECT
```
Replace the following:
- **GSA_NAME**: the name of the new IAM service account.
- **GSA_PROJECT**: the project ID of the Google Cloud project for your IAM service account.

3. Please ensure that this service account has all the roles requisite for interacting with the Compute Engine resources including VM Instances and Persistent Disks according to the GCP experiments that you're willing to run. You can grant additional roles using the following command:
```
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member "serviceAccount:GSA_NAME@GSA_PROJECT.iam.gserviceaccount.com" \
    --role "ROLE_NAME"
```
Replace the following:
- **PROJECT_ID**: your Google Cloud project ID.
- **GSA_NAME**: the name of your IAM service account.
- **GSA_PROJECT**: the project ID of the Google Cloud project of your IAM service account.
- **ROLE_NAME**: the IAM role to assign to your service account, like roles/spanner.viewer.

4. Allow the Kubernetes service account to be used for the GCP experiments to impersonate the GCP IAM service account by adding an [IAM policy binding](https://cloud.google.com/sdk/gcloud/reference/iam/service-accounts/add-iam-policy-binding) between the two service accounts. This binding allows the Kubernetes service account to act as the IAM service account.
```
gcloud iam service-accounts add-iam-policy-binding GSA_NAME@GSA_PROJECT.iam.gserviceaccount.com \
    --role roles/iam.workloadIdentityUser \
    --member "serviceAccount:PROJECT_ID.svc.id.goog[NAMESPACE/KSA_NAME]"
```
Replace the following:
- **GSA_NAME**: the name of your IAM service account.
- **GSA_PROJECT**: the project ID of the Google Cloud project of your IAM service account.
- **KSA_NAME**: the name of the service account to be used for LitmusChaos GCP experiments.
- **NAMESPACE**: the namespace in which the Kubernetes service account to be used for LitmusChaos GCP experiments is present.

5. Annotate the Kubernetes service account to be used for LitmusChaos GCP experiments with the email address of the GCP IAM service account.
```
kubectl annotate serviceaccount KSA_NAME \
    --namespace NAMESPACE \
    iam.gke.io/gcp-service-account=GSA_NAME@GSA_PROJECT.iam.gserviceaccount.com
```
Replace the following:
- **KSA_NAME**: the name of the service account to be used for LitmusChaos GCP experiments.
- **NAMESPACE**: the namespace in which the Kubernetes service account to be used for LitmusChaos GCP experiments is present.
- **GSA_NAME**: the name of your IAM service account.
- **GSA_PROJECT**: the project ID of the Google Cloud project of your IAM service account.

### STEP 3: Update ChaosEngine Manifest
Add the following value to the ChaosEngine manifest field `.spec.experiments[].spec.components.nodeSelector` to schedule the experiment pod on nodes that use Workload Identity.
```
iam.gke.io/gke-metadata-server-enabled: "true"
```

### STEP 4: Update ChaosExperiment Manifest
Remove `cloud-secret` at `.spec.definition.secrets` in the ChaosExperiment manifest as we are not using a secret to provide our GCP Service Account credentials.

Now you can run your GCP experiments with a keyless authentication provided by GCP using Workload Identity.

## How to disable IAM service accounts from accessing GCP resources?
To stop using Workload Identity, revoke access to the GCP IAM service account and disable Workload Identity on the cluster.

### STEP 1: Revoke access to the IAM service account
1. To revoke access to the GCP IAM service account, use the following command:
```
gcloud iam service-accounts remove-iam-policy-binding GSA_NAME@GSA_PROJECT.iam.gserviceaccount.com \
    --role roles/iam.workloadIdentityUser \
    --member "serviceAccount:PROJECT_ID.svc.id.goog[NAMESPACE/KSA_NAME]"
```
Replace the following:
- **PROJECT_ID**: the project ID of the GKE cluster.
- **NAMESPACE**: the namespace in which the Kubernetes service account to be used for LitmusChaos GCP experiments is present.
- **KSA_NAME**: the name of the service account to be used for LitmusChaos GCP experiments.
- **GSA_NAME**: the name of the IAM service account.
- **GSA_PROJECT**: the project ID of the IAM service account.

It can take up to 30 minutes for cached tokens to expire. 

2. Remove the annotation from the service account being used for LitmusChaos GCP experiments:
```
kubectl annotate serviceaccount KSA_NAME \
    --namespace NAMESPACE iam.gke.io/gcp-service-account-
```

### STEP 2: Disable Workload Identity
1. Disable Workload Identity on each node pool:
```
gcloud container node-pools update NODEPOOL_NAME \
    --cluster=CLUSTER_NAME \
    --workload-metadata=GCE_METADATA
```
Repeat this command for every node pool in the cluster.

2. Disable Workload Identity in the cluster:
```
gcloud container clusters update CLUSTER_NAME \
    --disable-workload-identity
```

## Troubleshooting Guide
Refer to the GCP documentation on troubleshooting Workload Identity [here](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity#troubleshooting).