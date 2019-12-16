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
<tr>
<td> DATA_PERSISTENCY   </td>
<td> Data accessibility & integrity verification post recovery (enabled, disabled)  </td>
</tr>
</table>  

### Procedure

Based on the value of env DATA_PERSISTENCE, the corresponding data consistency util will be executed. At present only busybox and percona-mysql are supported. Along with specifying env in the litmus experiment, user needs to pass name for configmap and the data consistency specific parameters required via configmap in the format as follows:

    parameters.yml: |
      blocksize: 4k
      blockcount: 1024
      testfile: difiletest

It is recommended to pass test-name for configmap and mount the corresponding configmap as volume in the litmus pod. The above snippet holds the parameters required for validation data consistency in busybox application.

For percona-mysql, the following parameters are to be injected into configmap.

    parameters.yml: |
      dbuser: root
      dbpassword: k8sDem0
      dbname: tdb

The configmap data will be utilised by litmus experiments as its variables while executing the scenario. Based on the data provided, litmus checks if the data is consistent after recovering from induced chaos.
