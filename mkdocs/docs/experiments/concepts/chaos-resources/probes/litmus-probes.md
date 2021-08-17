Litmus probes are pluggable checks that can be defined within the ChaosEngine for any chaos experiment. The experiment pods execute these checks based on the mode they are defined in & factor their success as necessary conditions in determining the verdict of the experiment (along with the standard “in-built” checks).
It can be provided at `.spec.experiments[].spec.probe` inside chaosengine. 
It supports four types: `cmdProbe`, `k8sProbe`, `httpProbe`, and `promProbe`.

### Probe Modes

The probes can be set up to run in five different modes. Which can be tuned via `mode` ENV. 
- `SOT`: Executed at the Start of the Test as a pre-chaos check
- `EOT`: Executed at the End of the Test as a post-chaos check
- `Edge`: Executed both, before and after the chaos
- `Continuous`: The probe is executed continuously, with a specified polling interval during the chaos injection.
- `OnChaos`: The probe is executed continuously, with a specified polling interval strictly for chaos duration of chaos

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/common/probe-modes.yaml yaml)
```yaml
# contains the common attributes or run properties
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
          insecureSkipVerify: false
          responseTimeout: <value>
          method:
            get: 
              criteria: ==
              responseCode: "<response code>"
        # modes for the probes
        # supports: [SOT, EOT, Edge, Continuous, OnChaos]
        mode: "Continuous"
        runProperties:
          probeTimeout: 5 
          interval: 2 
          retry: 1
          probePollingInterval: 2
         
```

### Run Properties

All probes share some common attributes. Which can be tuned via `runProperties` ENV.
- `probeTimeout`: Represents the time limit for the probe to execute the check specified and return the expected data.
- `retry`: The number of times a check is re-run upon failure in the first attempt before declaring the probe status as failed.
- `interval`: The period between subsequent retries
- `probePollingInterval`: The time interval for which continuous/onchaos probes should be sleep after each iteration.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/common/runproperties.yaml yaml)
```yaml
# contains the common attributes or run properties
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
          insecureSkipVerify: false
          responseTimeout: <value>
          method:
            get: 
              criteria: ==
              responseCode: "<response code>"
        mode: "Continuous"
        # contains runProperties for the probes
        runProperties:
          # time limit for the probe to execute the specified check
          probeTimeout: 5 #in seconds
          # the time period between subsequent retries
          interval: 2 #in seconds
          # number of times a check is re-run upon failure before declaring the probe status as failed
          retry: 1
          #time interval for which continuous probe should wait after each iteration
          # applicable for onChaos and Continuous probes
          probePollingInterval: 2
          
```

### Initial Delay Seconds

It Represents the initial waiting time interval for the probes. It can be tuned via 
`initialDelaySeconds` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/common/initial-delay-seconds.yaml yaml)
```yaml
# contains the initial delay seconds for the probes
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
          insecureSkipVerify: false
          responseTimeout: <value>
          method:
            get: 
              criteria: ==
              responseCode: "<response code>"
        mode: "Continuous"
        # contains runProperties for the probes
        RunProperties:
          probeTimeout: 5 
          interval: 2 
          retry: 1
          probePollingInterval: 2
          #initial waiting time interval for the probes
          initialDelaySeconds: 30 #in seconds
          
```

### Stop/Continue Experiment On Probe Failure

It can be set to true/false to stop or continue the experiment execution after the probe fails. It can be tuned via `stopOnFailure` ENV. 
It supports boolean values. The default value is `false`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/probes/common/stop-on-failure.yaml yaml)
```yaml
# contains the flag to stop/continue experiment based on the specified flag
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
          insecureSkipVerify: false
          responseTimeout: <value>
          method:
            get: 
              criteria: ==
              responseCode: "<response code>"
        mode: "Continuous"
        # contains runProperties for the probes
        runProperties:
          probeTimeout: 5 
          interval: 2 
          retry: 1
          probePollingInterval: 2
          #it can be set to true/false to stop or continue the experiment execution after probe fails
          # supports: true, false. default: false
          stopOnFailure: true
          
```

### Probe Chaining

Probe chaining enables reuse of probe a result (represented by the template function `{{ .&gt;probeName&lt;.probeArtifact.Register}})` in subsequent "downstream" probes defined in the ChaosEngine. 
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
