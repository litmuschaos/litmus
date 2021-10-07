# Probes Specifications

Litmus probes are pluggable checks that can be defined within the ChaosEngine for any chaos experiment. The experiment pods execute these checks based on the mode they are defined in & factor their success as necessary conditions in determining the verdict of the experiment (along with the standard “in-built” checks).

<table>
  <tr>
    <th>Probe Name</th>
    <th>Description</th>
    <th>User Guide</th>
  </tr>
  <tr>
    <td>Command Probe</td>
    <td>It defines the command probes</td>
    <td><a href="/litmus/experiments/concepts/chaos-resources/probes/cmdProbe">Command Probe</a></td>
  </tr>
  <tr>
    <td>HTTP Probe</td>
    <td>It defines the http probes</td>
    <td><a href="/litmus/experiments/concepts/chaos-resources/probes/httpProbe">HTTP Probe</a></td>
  </tr>
  <tr>
    <td>K8S Probe</td>
    <td>It defines the k8s probes</td>
    <td><a href="/litmus/experiments/concepts/chaos-resources/probes/k8sProbe">K8S Probe</a></td>
  </tr>
  <tr>
    <td>Prometheus Probe</td>
    <td>It defines the prometheus probes</td>
    <td><a href="/litmus/experiments/concepts/chaos-resources/probes/promProbe">Prometheus Probe</a></td>
  </tr>
  <tr>
    <td>Probe Chaining</td>
    <td>It chain the litmus probes</td>
    <td><a href="/litmus/experiments/concepts/chaos-resources/probes/probe-chaining">Probe Chaining</a></td>
  </tr>
</table>
