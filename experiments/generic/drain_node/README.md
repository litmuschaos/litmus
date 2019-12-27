## Experiment Metadata

<table>
<tr>
<th> Type </th>
<th>  Description   </th>
<th>  Storage </th>
<th> Applications </th>
<th> K8s Platform </th>
</tr>
<tr>
<td>  Chaos </td>
<td> Drain the node where application pod is scheduled. </td>
<td> OpenEBS </td>
<td> Percona MySQL </td>
<td> Any </td>
</tr>
</table>  

## Entry-Criteria

-   Application services are accessible & pods are healthy
-   Application writes are successful 

## Exit-Criteria

-   Application pod should be scheduled again.
-   Data written prior to chaos is successfully retrieved/read
-   Storage target pods are healthy

## Notes

-   This experiment drains the node where application pod is running and ensures if it is scheduled on another available node.

## Associated Utils 

-   [cordon_drain_node.yaml](/chaoslib/litmus/cordon_drain_node.yaml)

## Litmusbook Environment Variables

### Application

<table>
<tr>
<th> Parameter </th>
<th>  Description   </th>
</tr>
<tr>
<td> APP_NAMESPACE  </td>
<td> Namespace in which application pods are deployed  </td>
</tr>
<tr>
<td> APP_LABEL </td>
<td> Unique Labels in `key=value` format of application deployment </td>
</tr>
<tr>
<td> APP_PVC  </td>
<td> Name of persistent volume claim used for app's volume mounts </td>
</tr>
</table>  

### Health Checks 

<table>
<tr>
<th> Parameter </th>
<th>  Description   </th>
</tr>
<tr>
<td> LIVENESS_APP_NAMESPACE  </td>
<td> Namespace in which external liveness pods are deployed, if any </td>
</tr>
<tr>
<td> LIVENESS_APP_LABEL </td>
<td> Unique Labels in `key=value` format for external liveness pod, if any  </td>
</tr>
</table>  
