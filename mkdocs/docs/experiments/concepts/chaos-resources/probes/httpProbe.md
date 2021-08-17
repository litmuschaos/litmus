The http probe allows developers to specify a URL which the experiment uses to gauge health/service availability (or other custom conditions) as part of the entry/exit criteria. The received status code is mapped against an expected status. It supports http Get and Post methods.
It can be executed by setting `type` as `httpProbe` inside `.spec.experiments[].spec.probe`.

??? info "View the http probe schema"

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

### HTTP Get Request

In HTTP Get method, it sends an http GET request to the provided URL and matches the response code based on the given criteria(==, !=, oneOf).
It can be executed by setting `httpProbe/inputs.method.get` field.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/httpProbe/http-get.yaml yaml)
```yaml
# contains the http probes with get method and verify the response code
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
      - name: "check-frontend-access-url"
        type: "httpProbe"
        httpProbe/inputs:
          url: "<url>"
          method:
            # call http get method and verify the response code
            get: 
              # criteria which should be matched
              criteria: == # ==, !=, oneof
              # exepected response code for the http request, which should follow the specified criteria
              responseCode: "<response code>"
        mode: "Continuous"
        runProperties:
          probeTimeout: 5 
          interval: 2 
          retry: 1
          probePollingInterval: 2
         
```

### HTTP Post Request(http body is a simple)

It contains the http body, which is required for the http post request. It is used for the simple http body. The http body can be provided in the `body` field.
It can be executed by setting `httpProbe/inputs.method.post.body` field.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/httpProbe/http-post-with-body.yaml yaml)
```yaml
# contains the http probes with post method and verify the response code
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
      - name: "check-frontend-access-url"
        type: "httpProbe"
        httpProbe/inputs:
          url: "<url>"
          method:
            # call http post method and verify the response code
            post: 
              # value of the http body, used for the post request
              body: "<http-body>"
              # http body content type
              contentType: "application/json; charset=UTF-8"
              # criteria which should be matched
              criteria: "==" # ==, !=, oneof
              # exepected response code for the http request, which should follow the specified criteria
              responseCode: "200"
        mode: "Continuous"
        runProperties:
          probeTimeout: 5 
          interval: 2 
          retry: 1
          probePollingInterval: 2
         
```

### HTTP Post Request(http body is a complex)

In the case of a complex POST request in which the body spans multiple lines, the `bodyPath` attribute can be used to provide the path to a file consisting of the same. This file can be made available to the experiment pod via a ConfigMap resource, with the ConfigMap name being defined in the ChaosEngine OR the ChaosExperiment CR.
It can be executed by setting `httpProbe/inputs.method.post.body` field.

`NOTE`: It is mutually exclusive with the `body` field. If `body` is set then it will use the body field for the post request otherwise, it will use the `bodyPath` field.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/httpProbe/http-post-with-bodyPath.yaml yaml)
```yaml
# contains the http probes with post method and verify the response code
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
      - name: "check-frontend-access-url"
        type: "httpProbe"
        httpProbe/inputs:
          url: "<url>"
          method:
            # call http post method and verify the response code
            post: 
              # the configMap should be mounted to the experiment which contains http body
              # use the mounted path here
              bodyPath: "/mnt/body.yml"
              # http body content type
              contentType: "application/json; charset=UTF-8"
              # criteria which should be matched
              criteria: "==" # ==, !=, oneof
              # exepected response code for the http request, which should follow the specified criteria
              responseCode: "200"
        mode: "Continuous"
        runProperties:
          probeTimeout: 5 
          interval: 2 
          retry: 1
          probePollingInterval: 2
         
```

### Response Timout

It contains a flag to provide the response timeout for the http Get/Post request. It can be tuned via `.httpProbe/inputs.responseTimeout` field.
It is an optional field and its unit is milliseconds.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/httpProbe/http-responseTimeout.yaml yaml) 
```yaml
# defines the response timeout for the http probe
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
      - name: "check-frontend-access-url"
        type: "httpProbe"
        httpProbe/inputs:
          url: "<url>"
          # timeout for the http requests
          responseTimeout: 100 #in ms
          method:
            get: 
              criteria: == # ==, !=, oneof
              responseCode: "<response code>"
        mode: "Continuous"
        runProperties:
          probeTimeout: 5 
          interval: 2 
          retry: 1
          probePollingInterval: 2
         
```

### Skip Certification Check

It contains flag to skip certificate checks. It can bed tuned via `.httpProbe/inputs.insecureSkipVerify` field.
It supports boolean values. Provide it to `true` to skip the certificate checks. Its default value is false.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/httpProbe/http-insecureSkipVerify.yaml yaml)
```yaml
# skip the certificate checks for the httpProbe
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
      - name: "check-frontend-access-url"
        type: "httpProbe"
        httpProbe/inputs:
          url: "<url>"
          # skip certificate checks for the httpProbe
          # supports: true, false. default: false
          insecureSkipVerify: "true"
          method:
            get: 
              criteria: == 
              responseCode: "<response code>"
        mode: "Continuous"
        runProperties:
          probeTimeout: 5 
          interval: 2 
          retry: 1
          probePollingInterval: 2
         
```
