The prometheus probe allows users to run Prometheus queries and match the resulting output against specific conditions. The intent behind this probe is to allow users to define metrics-based SLOs in a declarative way and determine the experiment verdict based on its success. The probe runs the query on a Prometheus server defined by the endpoint, and checks whether the output satisfies the specified criteria.
It can be executed by setting `type` as `promProbe` inside `.spec.experiments[].spec.probe`.

??? info "View the prometheus probe schema"

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
    <td><code>.promProbe/inputs.endpoint</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the prometheus endpoints for the promProbe</td>
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
    <td>The <code>.promProbe/inputs.endpoint</code> contains the prometheus endpoints</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.promProbe/inputs.query</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the promql query for the promProbe</td>
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
    <td>The <code>.promProbe/inputs.query</code> contains the promql query to extract out the desired prometheus metrics via running it on the given prometheus endpoint</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.promProbe/inputs.queryPath</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the path of the promql query for the promProbe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> n/a {type: string}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.promProbe/inputs.queryPath</code> This field is used in case of complex queries that spans multiple lines, the queryPath attribute can be used to provide the path to a file consisting of the same. This file can be made available to the experiment pod via a ConfigMap resource, with the ConfigMap name being defined in the ChaosEngine OR the ChaosExperiment CR.</td>
    </tr>
    </table>


    <table>
    <tr>
    <th>Field</th>
    <td><code>.promProbe/inputs.comparator.criteria</code></td>
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
    <td> it supports {>=, <=, ==, >, <, !=, oneOf, between} criteria</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.promProbe/inputs.comparator.criteria</code> contains criteria of the comparision, which should be fulfill as part of comparision operation.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.promProbe/inputs.comparator.value</code></td>
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
    <td>The <code>.promProbe/inputs.comparator.value</code> contains value of the comparision, which should follow the given criteria as part of comparision operation.</td>
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

### Prometheus Query(query is a simple)

It contains the promql query to extract out the desired prometheus metrics via running it on the given prometheus endpoint. The prometheus query can be provided in the `query` field.
It can be executed by setting `.promProbe/inputs.query` field.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/promProbe/prom-probe-with-query.yaml yaml)
```yaml
# contains the prom probe which execute the query and match for the expected criteria
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
      - name: "check-probe-success"
        type: "promProbe"
        promProbe/inputs:
          # endpoint for the promethus service
          endpoint: "<prometheus-endpoint>"
          # promql query, which should be executed
          query: "<promql-query>"
          comparator:
            # criteria which should be followed by the actual output and the expected output
            #supports >=,<=,>,<,==,!= comparision
            criteria: "==" 
            # expected value, which should follow the specified criteria
            value: "<value-for-criteria-match>"
        mode: "Edge"
        runProperties:
          probeTimeout: 5
          interval: 5
          retry: 1
```

### Prometheus Query(query is a complex

In case of complex queries that spans multiple lines, the `queryPath` attribute can be used to provide the path to a file consisting of the same. This file can be made available to the experiment pod via a ConfigMap resource, with the ConfigMap name being defined in the ChaosEngine OR the ChaosExperiment CR.
It can be executed by setting `promProbe/inputs.queryPath` field.

`NOTE`: It is mutually exclusive with the `query` field. If `query` is set then it will use the query field otherwise, it will use the `queryPath` field.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/promProbe/prom-probe-with-queryPath.yaml yaml)
```yaml
# contains the prom probe which execute the query and match for the expected criteria
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
      - name: "check-probe-success"
        type: "promProbe"
        promProbe/inputs:
          # endpoint for the promethus service
          endpoint: "<prometheus-endpoint>"
          # the configMap should be mounted to the experiment which contains promql query
          # use the mounted path here
          queryPath: "<path of the query>"
          comparator:
            # criteria which should be followed by the actual output and the expected output
            #supports >=,<=,>,<,==,!= comparision
            criteria: "==" 
            # expected value, which should follow the specified criteria
            value: "<value-for-criteria-match>"
        mode: "Edge"
        runProperties:
          probeTimeout: 5
          interval: 5
          retry: 1
```
