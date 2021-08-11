The prometheus probe allows users to run Prometheus queries and match the resulting output against specific conditions. The intent behind this probe is to allow users to define metrics-based SLOs in a declarative way and determine the experiment verdict based on its success. The probe runs the query on a Prometheus server defined by the endpoint, and checks whether the output satisfies the specified criteria.
It can be executed by setting `type` as `promProbe` inside `.spec.experiments[].spec.probe`.

### Common Probe Tunables

Refer the [common attributes](litmus-probes.md) to tune the common tunables for all the probes.

### Prometheus Query(query is a simple)

It contains the promql query to extract out the desired prometheus metrics via running it on the given prometheus endpoint. The prometheus query can be provided in the `query` field.
It can be executed by setting `.promProbe/inputs.query` field.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/docs/experiments/chaos-resources/probes/promProbe/prom-probe-with-query.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/docs/experiments/chaos-resources/probes/promProbe/prom-probe-with-queryPath.yaml yaml)
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
