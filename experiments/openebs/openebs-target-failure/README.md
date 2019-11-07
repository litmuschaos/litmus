## Experiment Metadata

<table>
<tr>
<th> Type </th>
<th>  Description  </th>
<th> Storage </th>
<th> K8s Platform </th>
</tr>
<tr>
<td> Chaos </td>
<td> Kill the cstor target/Jiva controller container and check if gets created again </td>
<td> OPENEBS </td>
<td> Any </td>
</tr>
</table>

## Entry-Criteria

-   Application services are accessible & pods are healthy
-   Application writes are successful 

## Exit-Criteria

-   Application services are accessible & pods are healthy
-   Data written prior to chaos is successfully retrieved/read
-   Database consistency is maintained as per db integrity check utils
-   Storage target pods are healthy

### Notes

-   Typically used as a disruptive test, to cause loss of access to storage target by killing the containers.
-   The container should be created again and it should be healthy.

## Associated Utils 
-   [cstor_target_container_kill.yml](/experiments/openebs/openebs-target-failure/cstor_target_container_kill.yml)
-   [cstor_target_failure.yaml](/experiments/openebs/openebs-target-failure/cstor_target_failure.yaml)
-   [jiva_controller_container_kill.yml](/experiments/openebs/openebs-target-failure/jiva_controller_container_kill.yml)
-   [jiva_controller_pod_failure.yaml](/experiments/openebs/openebs-target-failure/jiva_controller_pod_failure.yaml)
-   [fetch_cstor_target_pod.yml](/utils/apps/openebs/fetch_cstor_target_pod.yml)
-   [fetch_jiva_controller_pod.yml](/utils/apps/openebs/fetch_jiva_controller_pod.yml)
-   [fetch_sc_and_provisioner.yml](/utils/apps/openebs/fetch_sc_and_provisioner.yml)
-   [target_affinity_check.yml](/utils/apps/openebs/target_affinity_check.yml)

## Litmus experiment Environment Variables

### Application

<table>
<tr>
<th>  Parameter   </t>
<th>  Description    </th>
</tr>
<tr> 
<td> APP_NAMESPACE </td>
<td> Namespace in which application pods are deployed  </td>
</tr>
<tr> 
<td> APP_LABEL </td>
<td>  Unique Labels in `key=value` format of application deployment </td>
</tr>
<tr> 
<td> APP_PVC  </td>
<td> Name of persistent volume claim used for app's volume mounts </td>
</tr>
<tr> 
<td>   DATA_PERSISTENCE  </td>
<td> Specify the application name against which data consistency has to be ensured. Example: busybox   </td>
</tr>
</table>

### Chaos 

<table>
<tr>
<th> CHAOS_TYPE   </th>
<th> The type of chaos to be induced. </th>
</tr>
<tr> 
<td> TARGET_CONTAINER </td>
<td> The container against which chaos has to be induced. </td>
</tr>
</table>

### Procedure

This scenario validates the behaviour of application and OpenEBS persistent volumes in the amidst of chaos induced on OpenEBS data plane and control plane components.

After injecting the chaos into the component specified via environmental variable, litmus experiment observes the behaviour of corresponding OpenEBS PV and the application which consumes the volume.

Based on the value of  env `DATA_PERSISTENCE`,  the corresponding data consistency util will be executed. At present only busybox and percona-mysql are supported. Along with specifying env in the litmus experiment, user needs to pass name for configmap and the data consistency specific parameters required via configmap in the format as follows:

```yml
    parameters.yml: |
      blocksize: 4k
      blockcount: 1024
      testfile: difiletest
```

It is recommended to pass test-name for configmap and mount the corresponding configmap as volume in the litmus pod. The above snippet holds the parameters required for validation data consistency in busybox application.

For percona-mysql, the following parameters are to be injected into configmap.

```yml
    parameters.yml: |
      dbuser: root
      dbpassword: k8sDemo
      dbname: tbd
```

The configmap data will be utilised by litmus experiments as its variables while executing the scenario.

Based on the data provided, litmus checks if the data is consistent after recovering from induced chaos.
