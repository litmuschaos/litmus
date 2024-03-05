The command probe allows developers to run shell commands and match the resulting output as part of the entry/exit criteria. The intent behind this probe was to allow users to implement a non-standard & imperative way of expressing their hypothesis. For example, the cmdProbe enables you to check for specific data within a database, parse the value out of a JSON blob being dumped into a certain path, or check for the existence of a particular string in the service logs.
It can be executed by setting `type` as `cmdProbe` inside `.spec.experiments[].spec.probe`.

??? info "View the command probe schema"

    <table>
    <tr>
    <th>Field</th>
    <td><code>.name</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the name of the probe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a  (type: string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.name</code> holds the name of the probe. It can be set based on the usecase</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.type</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the type of the probe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> <code>httpProbe</code>, <code>k8sProbe</code>, <code>cmdProbe</code>, <code>promProbe</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.type</code> supports four type of probes. It can one of the <code>httpProbe</code>, <code>k8sProbe</code>, <code>cmdProbe</code>, <code>promProbe</code></td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.mode</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the mode of the probe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> <code>SOT</code>, <code>EOT</code>, <code>Edge</code>, <code>Continuous</code>, <code>OnChaos</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.mode</code> supports five modes of probes. It can one of the <code>SOT</code>, <code>EOT</code>, <code>Edge</code>, <code>Continuous</code>, <code>OnChaos</code></td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.cmdProbe/inputs.command</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the command for the cmdProbe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a {type: string}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.cmdProbe/inputs.command</code> contains the shell command, which should be run as part of cmdProbe</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.cmdProbe/inputs.source</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the source for the cmdProbe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> It contains the source attributes i.e, image, imagePullPolicy</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.cmdProbe/inputs.source</code> It supports <code>inline</code> mode where command should be run within the experiment pod, and it can be tuned by omiting source field. Otherwise provide the source details(i.e, image) which can be used to launch a external pod where the command execution is carried out.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.cmdProbe/inputs.comparator.type</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold type of the data used for comparision</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> <code>string</code>, <code>int</code>, <code>float</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.cmdProbe/inputs.comparator.type</code> contains type of data, which should be compare as part of comparision operation</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.cmdProbe/inputs.comparator.criteria</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold criteria for the comparision</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> it supports {>=, <=, ==, >, <, !=, oneOf, between} for int & float type. And {equal, notEqual, contains, matches, notMatches, oneOf} for string type.</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.cmdProbe/inputs.comparator.criteria</code> contains criteria of the comparision, which should be fulfill as part of comparision operation.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.cmdProbe/inputs.comparator.value</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold value for the comparision</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> n/a {type: string}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.cmdProbe/inputs.comparator.value</code> contains value of the comparision, which should follow the given criteria as part of comparision operation.</td>
    </tr>
    </table>
    
    <table>
    <tr>
    <th>Field</th>
    <td><code>.runProperties.probeTimeout</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the timeout for the probes</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a {type: integer}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.runProperties.probeTimeout</code> represents the time limit for the probe to execute the specified check and return the expected data</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.runProperties.retry</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the retry count for the probes</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a {type: integer}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.runProperties.retry</code> contains the number of times a check is re-run upon failure in the first attempt before declaring the probe status as failed.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.runProperties.interval</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the interval for the probes</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a {type: integer}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.runProperties.interval</code> contains the interval for which probes waits between subsequent retries</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.runProperties.probePollingInterval</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the polling interval for the probes(applicable for <code>Continuous</code> mode only)</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a {type: integer}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.runProperties.probePollingInterval</code> contains the time interval for which continuous probe should be sleep after each iteration</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.runProperties.initialDelaySeconds</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the initial delay interval for the probes</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a {type: integer}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.runProperties.initialDelaySeconds</code> represents the initial waiting time interval for the probes.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.runProperties.stopOnFailure</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td> Flags to hold the stop or continue the experiment on probe failure</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>false {type: boolean}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.runProperties.stopOnFailure</code> can be set to true/false to stop or continue the experiment execution after probe fails</td>
    </tr>
    </table>

### Common Probe Tunables

Refer the [common attributes](litmus-probes.md) to tune the common tunables for all the probes.

### Inline Mode

In inline mode, the command probe is executed from within the experiment pod. It is preferred for simple shell commands. 
It is default mode, and it can be tuned by omitting source field.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/cmdProbe/inline-mode.yaml yaml)
```yaml
# execute the command inside the experiment pod itself
# cases where command doesn't need any extra binaries which is not available in litmsuchaos/go-runner image
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      probe:
      - name: "check-database-integrity"
        type: "cmdProbe"
        cmdProbe/inputs:
          # command which needs to run in cmdProbe
          command: "<command>"
          comparator:
            # output type for the above command
            # supports: string, int, float
            type: "string"
            # criteria which should be followed by the actual output and the expected output
            #supports [>=, <=, >, <, ==, !=] for int and float
            # supports [contains, equal, notEqual, matches, notMatches] for string values
            criteria: "contains"
            # expected value, which should follow the specified criteria
            value: "<value-for-criteria-match>"
        mode: "Edge"
        runProperties:
          probeTimeout: 5
          interval: 5
          retry: 1
          initialDelaySeconds: 5
```

### Source Mode

In source mode, the command execution is carried out from within a new pod whose image can be specified. It can be used when application-specific binaries are required.

??? info "View the source probe schema"

    <table>
    <tr>
    <th>Field</th>
    <td><code>.image</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the image of the source pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a  (type: string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.image</code> holds the image of the source pod/td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.hostNetwork</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to enable the hostNetwork for the source pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>(type: boolean)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.hostNetwork</code> flag to enable the hostnetwork. It supports boolean values and default value is false/td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.args</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the args for the source pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>(type: []string])</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.args</code> flag to hold the args for source pod/td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.env</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the envs for the source pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>(type: []corev1.EnvVar])</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.env</code> flag to hold the envs for source pod/td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.labels</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the labels for the source pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>(type: map[string]string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.labels</code> flag to hold the labels for source pod/td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.annotations</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the annotations for the source pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>(type: map[string]string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.annotations</code> flag to hold the annotations for source pod/td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.command</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the command for the source pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>(type: []string</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.command</code> flag to hold the command for source pod/td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.imagePullPolicy</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to set the imagePullPolicy for the source pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>(type: corev1.PullPolicy</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.imagePullPolicy</code> Flag to set the imagePullPolicy for the source pod/td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.privileged</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to set the privileged for the source pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>(type: boolean</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.privileged</code> Flag to set the privileged for the source pod. Default value is false/td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.nodeSelector</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the node selectors for the probe pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>(type: map[string]string</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.nodeSelector</code> Flag to hold the node selectors for the probe pod/td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.tolerations</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the tolerations for the probe pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>(type: []corev1.Tolerations</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.tolerations</code> Flag to hold the Tolerations for the probe pod</td>
    </tr>
    </table>
    
    <table>
    <tr>
    <th>Field</th>
    <td><code>.volumes</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the volumes for the source pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>(type: []corev1.Volume</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.volumes</code> Flag to hold the volumes for source pod/td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.volumeMount</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the volume mounts for the source pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>(type: []corev1.VolumeMount</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.volumes</code> Flag to hold the volume Mounts for source pod/td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.imagePullSecrets</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to set the imagePullSecrets for the source pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>(type: []corev1.LocalObjectReference</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.imagePullSecrets</code> Flag to set the imagePullSecrets for the source pod/td>
    </tr>
    </table>

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/cmdProbe/source-mode.yaml yaml)
```yaml
# it launches the external pod with the source image and run the command inside the same pod
# cases where command needs an extra binaries which is not available in litmsuchaos/go-runner image
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      probe:
      - name: "check-database-integrity"
        type: "cmdProbe"
        cmdProbe/inputs:
          # command which needs to run in cmdProbe
          command: "<command>"
          comparator:
            # output type for the above command
            # supports: string, int, float
            type: "string"
            # criteria which should be followed by the actual output and the expected output
            #supports [>=, <=, >, <, ==, !=, oneOf, between] for int and float
            # supports [contains, equal, notEqual, matches, notMatches, oneOf] for string values
            criteria: "contains"
            # expected value, which should follow the specified criteria
            value: "<value-for-criteria-match>"
          # source for the cmdProbe
          source:
            image: "<source-image>"
            imagePullPolicy: Always
            privileged: true
            hostNetwork: false
        mode: "Edge"
        runProperties:
          probeTimeout: 5
          interval: 5
          retry: 1
          initialDelaySeconds: 5
```
