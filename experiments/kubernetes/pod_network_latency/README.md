## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> Pod Network Latency </td>
 <td> This experiment causes flaky access to application replica by injecting network delay using pumba. It injects latency on the specified container by starting a traffic control (tc) process with netem rules to add egress delays. It Can test the application's resilience to lossy/flaky network </td>
 <td>  <a href="https://docs.litmuschaos.io/docs/pod-network-latency/"> Here </a> </td>
 </tr>
 </table>