# Chaos Engine Tunables

The ChaosEngine is the main user-facing chaos custom resource with a namespace scope and is designed to hold information around how the chaos experiments are executed. It connects an application instance with one or more chaos experiments, while allowing the users to specify run level details (override experiment defaults, provide new environment variables and volumes, options to delete or retain experiment pods, etc.,). This CR is also updated/patched with status of the chaos experiments, making it the single source of truth with respect to the chaos.

This section describes the fields in the ChaosEngine spec and the possible values that can be set against the same.

## ChaosEngine Spec Specification 

<table>
  <tr>
    <th>Field Name</th>
    <th>Description</th>
    <th>User Guide</th>
  </tr>
  <tr>
  <td>State Specification</td>
  <td>It defines the state of the chaosengine</td>
  <td><a href="/litmus/experiments/chaos-resources/engine-state">State Specifications</a></td>
  </tr>
  <tr>
  <td>Application Specification</td>
  <td>It defines the details of AUT and auxiliary applications</td>
  <td><a href="/litmus/experiments/chaos-resources/application-details">Application Specifications</a></td>
  </tr>
  <tr>
  <td>RBAC Specification</td>
  <td>It defines the chaos-service-account name</td>
  <td><a href="/litmus/experiments/chaos-resources/rbac-details">RBAC Specifications</a></td>
  </tr>
  <tr>
  <td>Runtime Specification</td>
  <td>It defines the runtime details of the chaosengine</td>
  <td><a href="/litmus/experiments/chaos-resources/runtime-details">Runtime Specifications</a></td>
  </tr>
  <tr>
  <td>Runner Specification</td>
  <td>It defines the runner pod specifications</td>
  <td><a href="/litmus/experiments/chaos-resources/runner-components">Runner Specifications</a></td>
  </tr>
  <tr>
  <td>Experiment Specification</td>
  <td>It defines the experiment pod specifications</td>
  <td><a href="/litmus/experiments/chaos-resources/experiment-components">Experiment Specifications</a></td>
  </tr>
</table>

## Probes

<table>
  <tr>
    <th>Probe Name</th>
    <th>Description</th>
    <th>User Guide</th>
  </tr>
  <tr>
  <td>Command Probe</td>
  <td>It defines the command probes</td>
  <td><a href="/litmus/experiments/chaos-resources/probes/cmdProbe">Command Probe</a></td>
  </tr>
   <tr>
  <td>HTTP Probe</td>
  <td>It defines the http probes</td>
  <td><a href="/litmus/experiments/chaos-resources/probes/httpProbe">HTTP Probe</a></td>
  </tr>
   <tr>
  <td>K8S Probe</td>
  <td>It defines the k8s probes</td>
  <td><a href="/litmus/experiments/chaos-resources/probes/k8sProbe">K8S Probe</a></td>
  </tr>
   <tr>
  <td>Prometheus Probe</td>
  <td>It defines the prometheus probes</td>
  <td><a href="/litmus/experiments/chaos-resources/probes/promProbe">Prometheus Probe</a></td>
  </tr>
</table>
