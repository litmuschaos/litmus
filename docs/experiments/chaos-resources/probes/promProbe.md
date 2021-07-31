## Prometheus Probe

The prometheus probe allows users to run Prometheus queries and match the resulting output against specific conditions. The intent behind this probe is to allow users to define metrics-based SLOs in a declarative way and determine the experiment verdict based on its success. The probe runs the query on a Prometheus server defined by the endpoint, and checks whether the output satisfies the specified criteria.
It can be executed by setting `type` as `promProbe` inside `.spec.experiments[].spec.probe`.

### Prometheus Query(query is a simple)

It contains the promql query to extract out the desired prometheus metrics via running it on the given prometheus endpoint. The prometheus query can be provided in the `query` field.
It can be executed by setting `.promProbe/inputs.query` field.

Use the following example to tune this:
<references to the sample manifest> 

### Prometheus Query(query is a complex

In case of complex queries that spans multiple lines, the `queryPath` attribute can be used to provide the path to a file consisting of the same. This file can be made available to the experiment pod via a ConfigMap resource, with the ConfigMap name being defined in the ChaosEngine OR the ChaosExperiment CR.
It can be executed by setting `promProbe/inputs.queryPath` field.

`NOTE`: It is mutually exclusive with the `query` field. If `query` is set then it will use the query field otherwise, it will use the `queryPath` field.

Use the following example to tune this:
<references to the sample manifest> 
