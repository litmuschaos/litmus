## Litmus Probes

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
<references to the sample manifest>

### Run Properties

All probes share some common attributes. Which can be tuned via `runProperties` ENV.
- `probeTimeout`: Represents the time limit for the probe to execute the check specified and return the expected data.
- `retry`: The number of times a check is re-run upon failure in the first attempt before declaring the probe status as failed.
- `interval`: The period between subsequent retries
- `probePollingInterval`: The time interval for which continuous/onchaos probes should be sleep after each iteration.

Use the following example to tune this:
<references to the sample manifest>

### Initial Delay Seconds

It Represents the initial waiting time interval for the probes. It can be tuned via 
`initialDelaySeconds` ENV.

Use the following example to tune this:
<references to the sample manifest>

### Stop/Continue Experiment On Probe Failure

It can be set to true/false to stop or continue the experiment execution after the probe fails. It can be tuned via `stopOnFailure` ENV. 
It supports boolean values. The default value is `false`.

Use the following example to tune this:
<references to the sample manifest>

### Probe Chaining

Probe chaining enables reuse of probe a result (represented by the template function `{{ .&gt;probeName&lt;.probeArtifact.Register}})` in subsequent "downstream" probes defined in the ChaosEngine. 
`Note`: The order of execution of probes in the experiment depends purely on the order in which they are defined in the ChaosEngine.

Use the following example to tune this:
<references to the sample manifest>
