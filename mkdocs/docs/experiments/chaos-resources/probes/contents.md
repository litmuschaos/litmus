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

### Basic Details

??? info "View the basic schema"

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
    <td><code>.data</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the data for the <code>create</code> operation of the k8sProbe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a {type: string}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.data</code> contains the manifest/data for the resource, which need to be created. It supported for <code>create</code> operation of k8sProbe only</td>
    </tr>
    </table>

### Command Probe

??? info "View the command probe schema"

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

### HTTP Probe

??? info "View the http probe schema"

    <table>
    <tr>
    <th>Field</th>
    <td><code>.httpProbe/inputs.url</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the URL for the httpProbe</td>
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
    <td>The <code>.httpProbe/inputs.url</code> contains the URL which the experiment uses to gauge health/service availability (or other custom conditions) as part of the entry/exit criteria.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.httpProbe/inputs.insecureSkipVerify</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the flag to skip certificate checks for the httpProbe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> <code>true</code>, <code>false</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.httpProbe/inputs.insecureSkipVerify</code> contains flag to skip certificate checks.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.httpProbe/inputs.responseTimeout</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the flag to response timeout for the httpProbe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> n/a {type: integer}</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.httpProbe/inputs.responseTimeout</code> contains flag to provide the response timeout for the http Get/Post request.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.httpProbe/inputs.method.get.criteria</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the criteria for the http get request</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> <code>==</code>, <code>!=</code>, <code>oneOf</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.httpProbe/inputs.method.get.criteria</code> contains criteria to match the http get request's response code with the expected responseCode, which need to be fulfill as part of httpProbe run</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.httpProbe/inputs.method.get.responseCode</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the expected response code for the get request</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> HTTP_RESPONSE_CODE</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.httpProbe/inputs.method.get.responseCode</code> contains the expected response code for the http get request as part of httpProbe run</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.httpProbe/inputs.method.post.contentType</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the content type of the post request</td>
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
    <td>The <code>.httpProbe/inputs.method.post.contentType</code> contains the content type of the http body data, which need to be passed for the http post request</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.httpProbe/inputs.method.post.body</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the body of the http post request</td>
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
    <td>The <code>.httpProbe/inputs.method.post.body</code> contains the http body, which is required for the http post request. It is used for the simple http body. If the http body is complex then use <code>.httpProbe/inputs.method.post.bodyPath</code> field.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.httpProbe/inputs.method.post.bodyPath</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the path of the http body, required for the http post request</td>
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
    <td>The <code>.httpProbe/inputs.method.post.bodyPath</code> This field is used in case of complex POST request in which the body spans multiple lines, the bodyPath attribute can be used to provide the path to a file consisting of the same. This file can be made available to the experiment pod via a ConfigMap resource, with the ConfigMap name being defined in the ChaosEngine OR the ChaosExperiment CR.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.httpProbe/inputs.method.post.criteria</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the criteria for the http post request</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> <code>==</code>, <code>!=</code>, <code>oneOf</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.httpProbe/inputs.method.post.criteria</code> contains criteria to match the http post request's response code with the expected responseCode, which need to be fulfill as part of httpProbe run</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.httpProbe/inputs.method.post.responseCode</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the expected response code for the post request</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> HTTP_RESPONSE_CODE</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.httpProbe/inputs.method.post.responseCode</code> contains the expected response code for the http post request as part of httpProbe run</td>
    </tr>
    </table>

### K8S Probe

??? info "View the k8s probe schema"
    <table>
    <tr>
    <th>Field</th>
    <td><code>.k8sProbe/inputs.group</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the group of the kubernetes resource for the k8sProbe</td>
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
    <td>The <code>.k8sProbe/inputs.group</code> contains group of the kubernetes resource on which k8sProbe performs the specified operation</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.k8sProbe/inputs.version</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the apiVersion of the kubernetes resource for the k8sProbe</td>
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
    <td>The <code>.k8sProbe/inputs.version</code> contains apiVersion of the kubernetes resource on which k8sProbe performs the specified operation</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.k8sProbe/inputs.resource</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the kubernetes resource name for the k8sProbe</td>
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
    <td>The <code>.k8sProbe/inputs.resource</code> contains the kubernetes resource name on which k8sProbe performs the specified operation</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.k8sProbe/inputs.namespace</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the namespace of the kubernetes resource for the k8sProbe</td>
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
    <td>The <code>.k8sProbe/inputs.namespace</code> contains namespace of the kubernetes resource on which k8sProbe performs the specified operation</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.k8sProbe/inputs.fieldSelector</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the fieldSelectors of the kubernetes resource for the k8sProbe</td>
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
    <td>The <code>.k8sProbe/inputs.fieldSelector</code> contains fieldSelector to derived the kubernetes resource on which k8sProbe performs the specified operation</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.k8sProbe/inputs.labelSelector</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the labelSelectors of the kubernetes resource for the k8sProbe</td>
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
    <td>The <code>.k8sProbe/inputs.labelSelector</code> contains labelSelector to derived the kubernetes resource on which k8sProbe performs the specified operation</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.k8sProbe/inputs.operation</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the operation type for the k8sProbe</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><code>create</code>, <code>delete</code>, <code>present</code>, <code>absent</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.k8sProbe/inputs.operation</code> contains operation which should be applied on the kubernetes resource as part of k8sProbe. It supports four type of operation. It can be one of <code>create</code>, <code>delete</code>, <code>present</code>, <code>absent</code>.</td>
    </tr>
    </table>

### Prometheus Probe

??? info "View the prometheus probe schema"

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

### Runproperties

??? info "View the run-properties schema"

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

### Comparator

??? info "View the comparator schema"

    <table>
    <tr>
    <th>Field</th>
    <td><code>type</code></td>
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
    <td>The <code>type</code> contains type of data, which should be compare as part of comparision operation</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>criteria</code></td>
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
    <td>The <code>criteria</code> contains criteria of the comparision, which should be fulfill as part of comparision operation.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>value</code></td>
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
    <td>The <code>value</code> contains value of the comparision, which should follow the given criteria as part of comparision operation.</td>
    </tr>
    </table>