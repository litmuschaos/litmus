Probe chaining enables reuse of probe a result (represented by the template function `{{ .<probeName>.probeArtifact.Register}})` in subsequent "downstream" probes defined in the ChaosEngine. 
`Note`: The order of execution of probes in the experiment depends purely on the order in which they are defined in the ChaosEngine.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/common/probe-chaining.yaml yaml)
```yaml
# chaining enables reuse of probe's result (represented by the template function {{ <probeName>.probeArtifact.Register}}) 
#-- in subsequent "downstream" probes defined in the ChaosEngine.
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
      - name: "probe1"
        type: "cmdProbe"
        cmdProbe/inputs:
          command: "<command>"
          comparator:
            type: "string"
            criteria: "equals"
            value: "<value-for-criteria-match>"
          source: "inline"
        mode: "SOT"
        runProperties:
          probeTimeout: 5
          interval: 5
          retry: 1
      - name: "probe2"
        type: "cmdProbe"
        cmdProbe/inputs:
          ## probe1's result being used as one of the args in probe2
          command: "<commmand> {{ .probe1.ProbeArtifacts.Register }} <arg2>"
          comparator:
            type: "string"
            criteria: "equals"
            value: "<value-for-criteria-match>"
          source: "inline"
        mode: "SOT"
        runProperties:
          probeTimeout: 5
          interval: 5
          retry: 1
          
```
