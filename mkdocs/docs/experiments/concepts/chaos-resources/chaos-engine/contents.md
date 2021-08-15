# Chaos Engine Specifications

Bind an instance of a given app with one or more chaos experiments, define run characteristics, override chaos defaults, define steady-state hypothesis, reconciled by Litmus Chaos Operator.

This section describes the fields in the ChaosEngine spec and the possible values that can be set against the same.

<table>
  <tr>
    <th>Field Name</th>
    <th>Description</th>
    <th>User Guide</th>
  </tr>
  <tr>
  <td>State Specification</td>
  <td>It defines the state of the chaosengine</td>
  <td><a href="/litmus/experiments/concepts/chaos-resources/chaos-engine/engine-state">State Specifications</a></td>
  </tr>
  <tr>
  <td>Application Specification</td>
  <td>It defines the details of AUT and auxiliary applications</td>
  <td><a href="/litmus/experiments/concepts/chaos-resources/chaos-engine/application-details">Application Specifications</a></td>
  </tr>
  <tr>
  <td>RBAC Specification</td>
  <td>It defines the chaos-service-account name</td>
  <td><a href="/litmus/experiments/concepts/chaos-resources/chaos-engine/rbac-details">RBAC Specifications</a></td>
  </tr>
  <tr>
  <td>Runtime Specification</td>
  <td>It defines the runtime details of the chaosengine</td>
  <td><a href="/litmus/experiments/concepts/chaos-resources/chaos-engine/runtime-details">Runtime Specifications</a></td>
  </tr>
  <tr>
  <td>Runner Specification</td>
  <td>It defines the runner pod specifications</td>
  <td><a href="/litmus/experiments/concepts/chaos-resources/chaos-engine/runner-components">Runner Specifications</a></td>
  </tr>
  <tr>
  <td>Experiment Specification</td>
  <td>It defines the experiment pod specifications</td>
  <td><a href="/litmus/experiments/concepts/chaos-resources/chaos-engine/experiment-components">Experiment Specifications</a></td>
  </tr>
</table>
