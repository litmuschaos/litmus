## Experiment Metadata

<table>
<tr>
<th> Type </th>
<th>  Description  </th>
<th> K8s Platform </th>
</tr>
<tr>
<td> Chaos </td>
<td> External Disk loss from the node </td>
<td> GKE/AWS </td>
</tr>
</table>

## Entry-Criteria

-   The disk is healthy before chaos injection

## Exit-Criteria

-   The disk is healthy post chaos injection

## Details

-   In this experiment, the external disk is detached from the node and wait for the chaos duration for automatically attached. If it failed to attach manually. It will be attached manually.
-   This chaos experiment is in beta state.

## Associated Chaos Utils 

-   litmuslib
    -   [litmus/disk_losss.yml](/chaoslib/litmus/platform/gke/disk_loss.yml)

## Litmusbook Environment Variables

### Application

<table>
<tr>
<th> Parameter </th>
<th> Description  </th>
<th> Type </th>
</tr>
<tr>
<td> APP_CHECK </td>
<td> If it checks to true, the experiment will check the status of the application. </td>
<td> Optional </td>
</tr>
<tr>
<td> APP_NAMESPACE </td>
<td> Namespace in which application pods are deployed </td>
<td> Optional </td>
</tr>
<tr>
<td> APP_LABEL </td>
<td> Unique Labels in `key=value` format of application deployment </td>
<td> Optional </td>
</tr>
</table>

### Chaos

<table>
<tr>
<th> Parameter </th>
<th> Description  </th>
<th> Type </th>
</tr>
<tr>
<td> TOTAL_CHAOS_DURATION </td>
<td> The time duration for chaos insertion (sec) </td>
<td> Mandatory </td>
</tr>
<tr>
<td> CHAOS_NAMESPACE </td>
<td> Cloud Platform name </td>
<td> Mandatory </td>
</tr>
<td> CLOUD_NAMESPACE </td>
<td> This is a chaos namespace which will create all infra chaos resources in that namespace </td>
<td> Mandatory </td>
</tr>
</tr>
<td> PROJECT_ID </td>
<td> GCP project ID </td>
<td> Mandatory </td>
</tr>
</tr>
<td> NODE_NAME </td>
<td> Node name of the cluster </td>
<td> Mandatory </td>
</tr>
<td> DISK_NAME </td>
<td> Disk Name of the node, it must be an external disk. </td>
<td> Mandatory </td>
</tr>
</tr>
</tr>
<td> ZONE_NAME </td>
<td> Zone Name of the node </td>
<td> Mandatory </td>
</tr>
</tr>
<td> CHAOSENGINE </td>
<td> ChaosEngine CR name associated with the experiment instance </td>
<td> Mandatory </td>
</tr>
<td> CHAOS_SERVICE_ACCOUNT </td>
<td> Service account used by the litmus </td>
<td> Mandatory </td>
</tr>
</table>

## Procedure

-   Identify the values for the mandatory ENV variables
-   Create the chaos job via `kubectl create -f disk_loss_k8s_job.yml`
-   Check the result of the experiment via `kubectl describe chaosresult disk_loss` (prefix chaosengine name to experiment name if applicable)
-   View experiment logs via `kubectl logs -f <chaos-pod-name>`

