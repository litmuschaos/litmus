## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> OpenEBS pool network loss </td>
 <td> 
  
 - This scenario validates the behaviour of stateful applications and OpenEBS data plane upon high latencies/network loss in accessing the storage replicas pod
 - Injects network loss on the specified container in the pool pod by starting a traffic control tc process with netem rules to add packet loss
 - Network loss is injected via pumba library with command pumba netem loss by passing the relevant network interface, network loss, chaos duration and regex filter for container name
 - Can test the stateful application's resilience to loss/slow iSCSI connections
 </td>
 <td><a href="https://docs.litmuschaos.io/docs/openebs-pool-network-loss">openebs-pool-network-loss</a> </td>
 </tr>
 </table>
