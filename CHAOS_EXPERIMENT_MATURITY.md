## Experiment Maturity Guidelines

This document lists the criteria as per which the maturity levels of chaos experiments can be derived.

<table>

 <tr>
  <th> Alpha </th>
  <th> Beta </th>
  <th> General Availabilty </th>
 </tr>

 <tr>

  <td> 
   <ul>
    <li>Injects the intended chaos on any one standard Kubernetes platform (GKE, EKS, DOKS, vSphere)</li>
    <li>Has a clearly defined entry (initial status) & exit (resiliency) criteria</li> 
    <li>Conforms to the standard litmus experiment structure (business logic, auxiliary tasks/utils, chaoslib)</li>
    <li>Provides a Kubernetes job manifest to execute the chaos experiment</li>
    <li>Accompanied by usage doc (readme) with pre-requisites, experiment tunables and procedure</li>
   </ul>
  </td>

  <td>
   <ul>
     <li>Successfully reverses the chaos, leaves cluster in a healthy state</li>
     <li>Clearly classified as an application-level or (cluster) infrastructure level chaos</li>
     <li>Leaves no chaos residue (cleans up resources created as part of execution) regardless of success</li>
     <li>Has sufficient debug messages (logs) indicating experiment flow</li>
     <li>Reuse of base chaoslib, existing (common) utils where possible</li>
     <li>Supports at least two of the standard Kubernetes platforms</li> 
     <li>Accompanied by a how-to demo video to aid users</li>
     <li>Successfully executed by the LitmusChaos Operator (executor) via ChaosExperiment CR</li>
     <li>Templatizes any manifest/resource specification used in the experiment execution</li>
   </ul> 
  </td>

  <td>
   <ul>
     <li>Supports all 4 standard Kubernetes platforms</li>
     <li>The ChaosResult CR contains sufficient info on the state (action & result of significant steps) of the chaos experiment</li>
   </ul>
  </td>

 </tr>

</table>
