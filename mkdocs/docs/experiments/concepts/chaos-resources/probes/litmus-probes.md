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

### Comparator

Comparator used to validate the SLO based on the probe's actual and expected values for the specified criteria. 

??? info "View the comparator's supported fields"

    <table>
    <tr>
    <th>Field</th>
    <td><code>.type</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold type of the probe's output</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>{int, float, string} (type: string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.type</code> holds the type of the probe's output/td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.criteria</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the criteria, which should to be followed by the actual and expected probe outputs</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> Float & Int type: {>,<.<=,>=,==,!=,oneOf,between}, String type: {equal, notEqual, contains, matches, notMatches, oneOf} </td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.criteria</code> holds the criteria, which should to be followed by the actual and expected probe outputs </td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.value</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the probe's expected value, which should follow the specified criteria</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> value can be of int, float, string, slice type</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.value</code> hold the probe's expected value, which should follow the specified criteria </td>
    </tr>
    </table>

Use the following example to tune this:

```yaml
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
          command: "<command>"
          comparator:
            # output type for the above command
            # supports: string, int, float
            type: "string"
            # criteria which should be followed by the actual output and the expected output
            #supports [>=, <=, >, <, ==, !=, oneOf, between] for int and float
            # supports [contains, equal, notEqual, matches, notMatches, oneOf] for string values
            criteria: "contains"
            # expected value, which should follow the specified criteria
            value: "<value-for-criteria-match>"
          source:
            image: "<source-image>"
        mode: "Edge"
        runProperties:
          probeTimeout: 5
          interval: 5
          retry: 1
          initialDelaySeconds: 5
```

#### Arithmetic criteria:

It is used to compare the numeric values(int,float) for arithmetic comparisons.
It consists of >, <, >=, <=, ==, != criteria

```yaml
comparator:
  type: int
  criteria: ">" 
  value: "20"
```

#### OneOf criteria:

It is used to compare numeric or string values, whether actual value lies in expected slice. Here expected values consists either of int/float/string values

```yaml
comparator:
  type: int
  criteria: "oneOf"
  value: "[400,404,405]"
```

#### Between criteria:

It is used to compare the numeric(int,float) values, whether actual value lies between the given lower and upper bound range[a,b]

```yaml
comparator:
  type: int
  criteria: "between"
  value: "[1000,5000]"
```

#### Equal and NotEqual criteria:

It is used to compare the string values, it checks whether actual value is equal/notEqual to the expected value or not

```yaml
comparator:
  type: string
  criteria: "equal" #equal or notEqual
  value: "<string value>"
```

#### Contains criteria:

It is used to compare the string values, it checks whether expected value is sub string of actual value or not

```yaml
comparator:
  type: string
  criteria: "contains" 
  value: "<string value>"
```

#### Matches and NotMatches criteria:

It is used to compare the string values, it checks whether the actual value matches/notMatches the regex(provided as expected value) or not

```yaml
comparator:
  type: string
  criteria: "matches" #matches or notMatches
  value: "<regex>"
```
