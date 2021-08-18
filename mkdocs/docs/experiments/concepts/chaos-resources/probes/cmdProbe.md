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
    <td> <code>inline</code>, <code>any source docker image</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.cmdProbe/inputs.source</code> It supports <code>inline</code> value when command can be run from within the experiment image. Otherwise provide the source image which can be used to launch a external pod where the command execution is carried out.</td>
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

In inline mode, the command probe is executed from within the experiment image. It is preferred for simple shell commands.
It can be tuned by setting `source` as `inline`.

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
          # source for the cmdProbe
          # it can be “inline” or any image
          source: "inline" 
        mode: "Edge"
        runProperties:
          probeTimeout: 5
          interval: 5
          retry: 1
          initialDelaySeconds: 5
```

### Source Mode

In source mode, the command execution is carried out from within a new pod whose image can be specified. It can be used when application-specific binaries are required.
It can be tuned by setting `source` as `<source-image>`.

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
            #supports [>=, <=, >, <, ==, !=] for int and float
            # supports [contains, equal, notEqual, matches, notMatches] for string values
            criteria: "contains"
            # expected value, which should follow the specified criteria
            value: "<value-for-criteria-match>"
          # source for the cmdProbe
          # it can be “inline” or any image
          source: "<source-image>" 
        mode: "Edge"
        runProperties:
          probeTimeout: 5
          interval: 5
          retry: 1
          initialDelaySeconds: 5
```
