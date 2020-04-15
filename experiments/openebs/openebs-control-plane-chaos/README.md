## Experiment Metadata

<table>
<tr>
<th> Name </th>
<th> Description </th>
<th> Documentation Link </th>
</tr>
<tr>
 <td> OpenEBS control plane chaos </td>
 <td>
  
 - Kill the OpenEBS control plane pods and check if they are rescheduled and healthy	
 - This scenario validates graceful & forced terminations of OpenEBS control plane pods
 - List of control plane components killed in this experiment:
   - maya-apiserver
   - openebs-admission-server
   - openebs-localpv-provisioner
   - openebs-ndm-operator
   - openebs-provisioner
   - openebs-snapshot-operator
   - openebs-ndm
 </td>
 <td><a href="https://docs.litmuschaos.io/docs/openebs-control-plane-chaos">openebs-control-plane-chaos</a> </td>
 </tr>
 </table>
