## HTTP Probe

The http probe allows developers to specify a URL which the experiment uses to gauge health/service availability (or other custom conditions) as part of the entry/exit criteria. The received status code is mapped against an expected status. It supports http Get and Post methods.
It can be executed by setting `type` as `httpProbe` inside `.spec.experiments[].spec.probe`.

### Common Probe Tunables

Refer the [common attributes](common.md) to tune the common tunables for all the probes.

### HTTP Get Request

In HTTP Get method, it sends an http GET request to the provided URL and matches the response code based on the given criteria(==, !=, oneOf).
It can be executed by setting `httpProbe/inputs.method.get` field.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/probes/httpProbe/http-get.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/probes/httpProbe/http-post-with-body.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/probes/httpProbe/http-post-with-bodyPath.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/probes/httpProbe/http-responseTimeout.yaml yaml) 
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

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/probes/httpProbe/http-insecureSkipVerify.yaml yaml)
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
