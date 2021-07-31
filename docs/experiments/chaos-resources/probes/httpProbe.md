## HTTP Probe

The http probe allows developers to specify a URL which the experiment uses to gauge health/service availability (or other custom conditions) as part of the entry/exit criteria. The received status code is mapped against an expected status. It supports http Get and Post methods.
It can be executed by setting `type` as `httpProbe` inside `.spec.experiments[].spec.probe`.

### HTTP Get Request

In HTTP Get method, it sends an http GET request to the provided URL and matches the response code based on the given criteria(==, !=, oneOf).
It can be executed by setting `httpProbe/inputs.method.get` field.

Use the following example to tune this:
<references to the sample manifest> 

### HTTP Post Request(http body is a simple)

It contains the http body, which is required for the http post request. It is used for the simple http body. The http body can be provided in the `body` field.
It can be executed by setting `httpProbe/inputs.method.post.body` field.

Use the following example to tune this:
<references to the sample manifest> 

### HTTP Post Request(http body is a complex)

In the case of a complex POST request in which the body spans multiple lines, the `bodyPath` attribute can be used to provide the path to a file consisting of the same. This file can be made available to the experiment pod via a ConfigMap resource, with the ConfigMap name being defined in the ChaosEngine OR the ChaosExperiment CR.
It can be executed by setting `httpProbe/inputs.method.post.body` field.

`NOTE`: It is mutually exclusive with the `body` field. If `body` is set then it will use the body field for the post request otherwise, it will use the `bodyPath` field.

Use the following example to tune this:
<references to the sample manifest> 

### Response Timout

It contains a flag to provide the response timeout for the http Get/Post request. It can be tuned via `.httpProbe/inputs.responseTimeout` field.
It is an optional field and its unit is milliseconds.

Use the following example to tune this:
<references to the sample manifest> 

### Skip Certification Check

It contains flag to skip certificate checks. It can bed tuned via `.httpProbe/inputs.insecureSkipVerify` field.
It supports boolean values. Provide it to `true` to skip the certificate checks. Its default value is false.

Use the following example to tune this:
<references to the sample manifest> 
