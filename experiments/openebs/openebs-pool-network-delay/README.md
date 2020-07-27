## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> OpenEBS pool network latency </td>
 <td> 
  
 - This scenario validates the behaviour of stateful applications and OpenEBS data plane upon high latencies/network delays in accessing the storage replicas pod
 - Injects latency on the specified container in the controller pod by staring a traffic control tc process with netem rules to add egress delays
 - Latency is injected via pumba library with command pumba netem delay by passing the relevant network interface, latency, chaos duration and regex filter for container name
 - Can test the stateful application's resilience to loss/slow iSCSI connections
 </td>
 <td><a href="https://docs.litmuschaos.io/docs/openebs-pool-network-delay">openebs-pool-network-delay</a> </td>
 </tr>
 </table>
