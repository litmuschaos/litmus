## Experiment Metadata

<table>
<tr>
<th> Type </th>
<th>  Description  </th>
<th> K8s Platform </th>
</tr>
<tr>
<td> Chaos </td>
<td> Fillup Ephemeral Storage of a Resource </td>
<td> Any </td>
</tr>
</table>
## Entry-Criteria

-   Application pods are healthy before chaos injection.

## Exit-Criteria

-   Application pods are healthy post chaos injection.

## Details

-   Causes Disk Stress by filling up the Ephemeral Storage of the Pod using one of it containers.
-   Causes Pod to get Evicted if the Pod exceeds it Ephemeral Storage Limit.
-   Tests the Ephemeral Storage Limits, to ensure those parameters are sufficient.

## Integrations

-   Disk Fill can be effected using one of these chaos libraries: `litmus`.
-   The desired chaoslib can be selected by setting the above options as value for the env variable `LIB`

## Associated Chaos Utils 

-   litmuslib
-   [litmus/disk_fill_by_litmus.yml](/chaoslib/litmus/disk_fill_by_litmus.yml)
-   [experiments/generic/disk_fill/disk_fill_ds.yml](/experiments/generic/disk_fill/disk_fill_ds.yml)

## Litmusbook Environment Variables

### Application

<table>
<tr>
<th>  Parameter   </t>
<th>  Description    </th>
<th>  Type  </th>
</tr>
<tr> 
<td> APP_NAMESPACE </td>
<td> Namespace in which application pods are deployed  </td>
<td> Mandatory  </td>
</tr>
<tr> 
<td> APP_LABEL </td>
<td>  Unique Labels in `key=value` format of application deployment </td>
<td> Mandatory  </td>
</tr>
</table>

### Chaos

<table>
<tr>
<th> Parameter </th>
<th> Description </th>
<th> Type </th>
</tr>
<tr> 
<td> TOTAL_CHAOS_DURATION </td>
<td> The time duration for chaos insertion (sec) </td>
<td> Mandatory </td>
</tr>
<tr> 
<td> CHAOSENGINE </td>
<td> ChaosEngine CR name associated with the experiment instance </td>
<td> Optional </td>
</tr>
<tr> 
<td> CHAOS_SERVICE_ACCOUNT </td>
<td> Service account used by the deployment </td>
<td> Optional </td>
</tr>
<tr> 
<td> FILL_PERCENTAGE </td>
<td> Percentage to fill the Ephemeral storage limit </td>
<td> Mandatory </td>
</tr>
</table>

## Procedure

-   Identify the values for the mandatory ENV variables
-   Create the chaos job via `kubectl create -f disk_fill_k8s_job.yml`
-   Check result of the experiment via `kubectl describe chaosresult disk-fill` (prefix chaosengine name to experiment name if applicable)
-   View experiment logs via `kubectl logs -f <chaos-pod-name>`

## Limitations

-   Need Kubernetes Version > 1.13