### RELEASE SUMMARY

This doc consists of a revision table that highlights the important changes in the LitmusChaos custom resource schema and other infra components 
while providing the links to release details. Meant to be a helpful chronicler of the Litmus journey! 

<table>
 <tr>
   <td>1.6.0</td>
   <td>15th July, 2020</td>
   <td>No Schema changes</td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/1.6.0">Release Notes</a></td>
   <td><a href="https://docs.litmuschaos.io/docs/getstarted">Documentation</a></td>
   <td>N/A</td>
   <td><a href="https://github.com/litmuschaos/chaos-charts/releases/tag/1.6.0">Chaos Charts Bundle</a></td>
 </tr>

 <tr>
   <td>1.5.1</td>
   <td>6th July, 2020</td>
   <td> 
     <ul>
       <li><b>New</b> (chaosexperiment): <code>.spec.definition.securityContext</code></li>
       <li><b>New</b> (chaosexperiment): <code>.spec.definition.hostPID</code></li>
       <li><b>New</b> (chaosengine): <code>spec.experiments.spec[].spec.components.nodeSelector</code></li>
     </ul>
   </td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/1.5.1">Release Notes</a></td>
   <td><a href="https://docs.litmuschaos.io/docs/getstarted">Documentation</a></td>
   <td>N/A</td>
   <td><a href="https://github.com/litmuschaos/chaos-charts/releases/tag/1.5.0">Chaos Charts Bundle</a></td>
 </tr>
 
 <tr>
   <td>1.5.0</td>
   <td>15th June, 2020</td>
   <td> 
     <ul>
       <li><b>Deprecated</b> (chaosschedule): <code>.spec.schedule.type</code></li>
       <li><b>New</b> (chaosschedule): <code>.spec.schedule.once.exectionTime</code> replaces: <code>.spec.schedule.exectionTime</code></li>
       <li><b>New</b> (chaosschedule): <code>.spec.schedule.repeat.startTime/endTime</code> replaces: <code>.spec.schedule.startTime/endTime</code></li>
       <li><b>New</b> (chaosexperiment): <code>.spec.definition.imagePullPolicy</code></li>
     </ul>
   </td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/1.5.0">Release Notes</a></td>
   <td><a href="https://docs.litmuschaos.io/docs/getstarted">Documentation</a></td>
   <td>N/A</td>
   <td><a href="https://github.com/litmuschaos/chaos-charts/releases/tag/1.5.0">Chaos Charts Bundle</a></td>
 </tr>


 <tr>
   <td>1.4.1</td>
   <td>3rd June, 2020</td>
   <td>No Schema changes</td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/1.4.1">Release Notes</a></td>
   <td><a href="https://docs.litmuschaos.io/docs/1.4.0/getstarted/">Documentation</a></td>
   <td>N/A</td>
   <td><a href="https://github.com/litmuschaos/chaos-charts/releases/tag/1.4.1">Chaos Charts Bundle</a></td>
 </tr>

 <tr>
   <td>1.4.0</td>
   <td>15th May, 2020</td>
   <td> 
     <ul>
       <li><b>New</b> (chaosschedule): Introduce custom resource to schedule chaos on targets</li>
     </ul>
   </td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/1.4.0">Release Notes</a></td>
   <td><a href="https://docs.litmuschaos.io/docs/1.4.0/getstarted/">Documentation</a></td>
   <td>N/A</td>
   <td><a href="https://github.com/litmuschaos/chaos-charts/releases/tag/1.4.0">Chaos Charts Bundle</a></td>
 </tr>

 <tr>
   <td>1.3.0</td>
   <td>15th April, 2020</td>
   <td>No Schema changes</td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/1.3.0">Release Notes</a></td>
   <td><a href="https://docs.litmuschaos.io/docs/getstarted">Documentation</a></td>
   <td>N/A</td>
   <td><a href="https://github.com/litmuschaos/chaos-charts/releases/tag/1.3.0">Chaos Charts Bundle</a></td>
 </tr>

 <tr>
   <td>1.2.2</td>
   <td>1st April, 2020</td>
   <td>No Schema changes</td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/1.2.2">Release Notes</a></td>
   <td><a href="https://docs.litmuschaos.io/docs/1.2.0/getstarted">Documentation</a></td>
   <td>N/A</td>
   <td><a href="https://github.com/litmuschaos/chaos-charts/releases/tag/1.2.2">Chaos Charts Bundle</a></td>
 </tr>

 <tr>
   <td>1.2.1</td>
   <td>16th March, 2020</td>
   <td>No Schema changes</td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/1.2.1">Release Notes</a></td>
   <td><a href="https://docs.litmuschaos.io/docs/1.2.0/getstarted">Documentation</a></td>
   <td>N/A</td>
   <td><a href="https://github.com/litmuschaos/chaos-charts/releases/tag/1.2.1">Chaos Charts Bundle</a></td>
 </tr>
 
 <tr>
   <td>1.2.0</td>
   <td>15th March, 2020</td>
   <td> 
     <ul>
       <li><b>Deprecated</b> (chaosresult): <code>.spec.experimentstatus</code></li>
       <li><b>New</b> (chaosresult): <code>.status.experimentstatus</code></li>
       <li><b>New</b> (chaosengine): <code>.status.engineStatus</code> supports: <code>completed</code></li>
     </ul>
   </td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/1.2.0">Release Notes</a></td>
   <td><a href="https://docs.litmuschaos.io/docs/getstarted">Documentation</a></td>
   <td><a href="https://blog.mayadata.io/litmus/litmuschaos-1.2-makes-chaos-eventful">Blog</a></td>
   <td><a href="https://github.com/litmuschaos/chaos-charts/releases/tag/1.2.0">Chaos Charts Bundle</a></td>
 </tr>

 <tr>
   <td>1.1.1</td>
   <td>28th Feb, 2020</td>
   <td>No Schema Changes</td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/1.1.1">Release Notes</a></td>
   <td><a href="https://docs.litmuschaos.io/docs/1.1.0/getstarted/">Documentation</a></td>
   <td>N/A</td>
   <td><a href="https://github.com/litmuschaos/chaos-charts/releases/tag/1.1.1">Chaos Charts Bundle</a></td>
 </tr>

 <tr>
   <td>1.1.0</td>
   <td>15th Feb, 2020</td>
   <td> 
     <ul>
       <li><b>Deprecated</b> (chaosengine): <code>.spec.appType</code></li>
       <li><b>New</b> (chaosengine): <code>.spec.annotationCheck</code></li>
       <li><b>New</b> (chaosengine): <code>.spec.engineState</code></li>
       <li><b>New</b> (chaosengine): <code>.spec.experiments.spec[].spec.components</code> (env, configmap, secret)</li>
       <li><b>New</b> (chaosengine): <code>.status.engineStatus</code></li>
     </ul>
   </td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/1.1.0">Release Notes</a></td>
   <td><a href="https://docs.litmuschaos.io/docs/1.1.0/getstarted/">Documentation</a></td>
   <td><a href="https://blog.mayadata.io/openebs/litmuschaos-1.1-supports-chaos-abort-more">Blog</a></td>
   <td><a href="https://github.com/litmuschaos/chaos-charts/releases/tag/1.1.0">Chaos Charts Bundle</a></td>
 </tr>

 <tr>
   <td>1.0.1</td>
   <td>25th Jan, 2020</td>
   <td>No Schema Changes</td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/1.0.1">Release Notes</a></td>
   <td><a href="https://docs.litmuschaos.io/docs/1.0.0/getstarted/">Documentation</a></td>
   <td>N/A</td>
   <td>N/A</td>
 </tr>
 
 <tr>
   <td>1.0.0</td>
   <td>15th Jan, 2020</td>
   <td> 
     <ul>
       <li><b>New</b> (chaosengine): <code>.spec.auxiliaryAppInfo</code></li>
       <li><b>New</b> (chaosexperiment): <code>.spec.definition.permissions</code></li>
       <li><b>New</b> (chaosexperiment): <code>.spec.definition.scope</code></li>
     </ul>
   </td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/1.0.0">Release Notes</a></td>
   <td><a href="https://docs.litmuschaos.io/docs/1.0.0/getstarted/">Documentation</a></td>
   <td><a href="https://blog.mayadata.io/openebs/litmuschaos-1.0-polishing-the-stone">Blog</a></td>
   <td>N/A</td>
 </tr>

 <tr>
   <td>0.9.0</td>
   <td>13th Dec, 2019</td>
   <td> 
     <ul>
       <li><b>New</b> (chaosengine): <code>.spec.components.runner.type</code> supports <code>go</code></li>
       <li><b>New</b> (chaosexperiment): <code>.spec.definition.configmaps</code></li>
       <li><b>New</b> (chaosexperiment): <code>.spec.definition.secrets</code></li>
     </ul>
   </td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/0.9.0">Release Notes</a></td>
   <td>N/A</td>
   <td><a href="https://blog.mayadata.io/openebs/litmuschaos-0.9-stabilize-the-chaos">Blog</a></td>
   <td>N/A</td>
 </tr>

 <tr>
   <td>0.8.0</td>
   <td>15th Nov, 2019</td>
   <td> 
     <ul>
       <li><b>New</b> (chaosengine): <code>.spec.jobCleanupPolicy</code></li>
       <li><b>New</b> (chaosengine): <code>.spec.components.runner.type</code></li>
       <li><b>New</b> (chaosengine): <code>.spec.components.runner.image</code></li>
       <li><b>New</b> (chaosengine): <code>.spec.components.monitor.type</code></li>
       <li><b>New</b> (chaosengine): <code>.spec.components.monitor.image</code></li>
       <li><b>New</b> (chaosexperiment): <code>.spec.definition.secrets</code></li>
     </ul>
   </td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/0.8.0">Release Notes</a></td>
   <td>N/A</td>
   <td><a href="https://blog.mayadata.io/openebs/litmuschaos-0.8-community-builds-the-chaoshub">Blog</a></td>
   <td>N/A</td>
 </tr>

 <tr>
   <td>0.7.0</td>
   <td>14th Oct, 2019</td>
   <td> 
     <ul>
       <li><b>New</b> (chaosengine): <code>.spec.monitoring</code></li>
       <li><b>New</b> (chaosengine): <code>.status.experimentStatuses</code></li>
       <li><b>New</b> (chaosengine): <code>.spec.experiments.spec[].spec</code></li>
     </ul>
   </td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/0.7.0">Release Notes</a></td>
   <td>N/A</td>
   <td><a href="https://blog.mayadata.io/openebs/litmuschaos-0.7-streamlines-kubernetes-chaos-engineering">Blog</a></td>
   <td>N/A</td>
 </tr>

 <tr>
   <td>0.6.0</td>
   <td>13th Sept, 2019</td>
   <td>No Schema Changes</td>
   <td><a href="https://github.com/litmuschaos/litmus/releases/tag/0.6.0">Release Notes</a></td>
   <td>N/A</td>
   <td><a href="https://blog.mayadata.io/openebs/kubernetes-chaos-engineering-with-litmuschaos-0.6-release">Blog</a></td>
   <td>N/A</td>
 </tr>

 <tr>
   <td>0.5.0</td>
   <td>22nd June, 2019</td>
   <td>
     <ul>
         <li><b>New</b> (chaos custom resources): Introduce custom resource definitions for chaos</li>
     </ul>
   </td>
   <td>N/A</td>
   <td>N/A</td>
   <td><a href="https://blog.mayadata.io/openebs/providing-chaos-hooks-to-applications-using-litmus-operator">Blog</a></td>
   <td>N/A</td>
 </tr>

</table>

