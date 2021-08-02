The command probe allows developers to run shell commands and match the resulting output as part of the entry/exit criteria. The intent behind this probe was to allow users to implement a non-standard & imperative way of expressing their hypothesis. For example, the cmdProbe enables you to check for specific data within a database, parse the value out of a JSON blob being dumped into a certain path, or check for the existence of a particular string in the service logs.
It can be executed by setting `type` as `cmdProbe` inside `.spec.experiments[].spec.probe`.

### Common Probe Tunables

Refer the [common attributes](common.md) to tune the common tunables for all the probes.

### Inline Mode

In inline mode, the command probe is executed from within the experiment image. It is preferred for simple shell commands.
It can be tuned by setting `source` as `inline`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/probes/cmdProbe/inline-mode.yaml yaml)
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

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/experiments-by-example/docs/experiments/chaos-resources/probes/cmdProbe/source-mode.yaml yaml)
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
