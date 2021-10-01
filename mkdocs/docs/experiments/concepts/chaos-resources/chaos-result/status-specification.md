It contains status details provided at `status` inside chaosresult.

## Experiment Status

It contains experiment status provided at `status.experimentStatus` inside chaosresult. It contains following fields:

- `failStep`: Flag to show the failure step of the ChaosExperiment
- `phase`: Flag to show the current phase of the experiment
- `probesuccesspercentage`: Flag to show the probe success percentage
- `verdict`: Flag to show the verdict of the experiment

??? info "View the experiment status" 

    <table>
    <tr>
    <th>Field</th>
    <td><code>.status.experimentStatus.failstep</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to show the failure step of the ChaosExperiment</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>n/a<i>(type: string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.experimentStatus.failstep</code> Show the step at which the experiment failed. It helps in faster debugging of failures in the experiment execution.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.status.experimentStatus.phase</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to show the current phase of the experiment</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>Awaited,Running,Completed,Aborted</i> (type: string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.experimentStatus.phase</code> shows the current phase in which the experiment is. It gets updated as the experiment proceeds.If the experiment is aborted then the status will be Aborted.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.status.experimentStatus.probesuccesspercentage</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to show the probe success percentage</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>1 to 100</i> (type: int)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.experimentStatus.probesuccesspercentage</code> shows the probe success percentage which is a ratio of successful checks v/s total probes.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.status.experimentStatus.verdict</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to show the verdict of the experiment.</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>Awaited,Pass,Fail,Stopped</i> (type: string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.experimentStatus.verdict</code> shows the verdict of the experiment. It is <code>Awaited</code> when the experiment is in progress and ends up with Pass or Fail according to the experiment result.</td>
    </tr>
    </table>

view the sample example:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-result/status/experiment-status.out yaml)

```yaml
Name:         engine-nginx-pod-delete
Namespace:    default
Labels:       app.kubernetes.io/component=experiment-job
              app.kubernetes.io/part-of=litmus
              app.kubernetes.io/version=1.13.8
              chaosUID=aa0a0084-f20f-4294-a879-d6df9aba6f9b
              controller-uid=6943c955-0154-4542-8745-de991eb47c61
              job-name=pod-delete-w4p5op
              name=engine-nginx-pod-delete
Annotations:  <none>
API Version:  litmuschaos.io/v1alpha1
Kind:         ChaosResult
Metadata:
  Creation Timestamp:  2021-09-29T13:28:59Z
  Generation:          6
  Resource Version:    66788
  Self Link:           /apis/litmuschaos.io/v1alpha1/namespaces/default/chaosresults/engine-nginx-pod-delete
  UID:                 fe7f01c8-8118-4761-8ff9-0a87824d863f
Spec:
  Engine:      engine-nginx
  Experiment:  pod-delete
Status:
  Experiment Status:
    # step on which experiment fails
    Fail Step:                 N/A
    # phase of the chaos result
    Phase:                     Completed
    # Success Percentage of the litmus probes
    Probe Success Percentage:  100
    # Verdict of the chaos result
    Verdict:                   Pass
  History:
    Failed Runs:   1
    Passed Runs:   1
    Stopped Runs:  0
    Targets:
      Chaos Status:  targeted
      Kind:          deployment
      Name:          hello
Events:              <none>
```

## Result History

It contains history of experiment runs present at `status.history`. It contains following fields:

- `passedRuns`: It contains cumulative passed run count
- `failedRuns`: It contains cumulative failed run count
- `stoppedRuns`: It contains cumulative stopped run count
- `targets.name`: It contains name of target application
- `target.kind`: It contains kinds of target application
- `target.chaosStatus`: It contains chaos status

??? info "View the history details" 

    <table>
    <tr>
    <th>Field</th>
    <td><code>.status.history.passedRuns</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>It contains cumulative passed run count</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> ANY NON NEGATIVE INTEGER </td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.history.passedRuns</code> contains cumulative passed run counts for a specific ChaosResult.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.status.history.failedRuns</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>It contains cumulative failed run count</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> ANY NON NEGATIVE INTEGER </td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.history.failedRuns</code> contains cumulative failed run counts for a specific ChaosResult.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.status.history.stoppedRuns</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>It contains cumulative stopped run count</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> ANY NON NEGATIVE INTEGER </td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.history.stoppedRuns</code> contains cumulative stopped run counts for a specific ChaosResult.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.status.history.targets.name</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>It contains name of the target application</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> string </td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.history.targets.name</code> contains name of the target application</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.status.history.targets.kind</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>It contains kind of the target application</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> string </td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.history.targets.kind</code> contains kind of the target application</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.status.history.targets.chaosStatus</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>It contains status of the chaos</td>
    </tr>
    <tr>
    <th>Range</th>
    <td> targeted, injected, reverted </td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.history.targets.chaosStatus</code> contains status of the chaos</td>
    </tr>
    </table>

view the sample example:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-result/status/history.out yaml)

```yaml
Name:         engine-nginx-pod-delete
Namespace:    default
Labels:       app.kubernetes.io/component=experiment-job
              app.kubernetes.io/part-of=litmus
              app.kubernetes.io/version=1.13.8
              chaosUID=aa0a0084-f20f-4294-a879-d6df9aba6f9b
              controller-uid=6943c955-0154-4542-8745-de991eb47c61
              job-name=pod-delete-w4p5op
              name=engine-nginx-pod-delete
Annotations:  <none>
API Version:  litmuschaos.io/v1alpha1
Kind:         ChaosResult
Metadata:
  Creation Timestamp:  2021-09-29T13:28:59Z
  Generation:          6
  Resource Version:    66788
  Self Link:           /apis/litmuschaos.io/v1alpha1/namespaces/default/chaosresults/engine-nginx-pod-delete
  UID:                 fe7f01c8-8118-4761-8ff9-0a87824d863f
Spec:
  Engine:      engine-nginx
  Experiment:  pod-delete
Status:
  Experiment Status:
    Fail Step:                 N/A
    Phase:                     Completed
    Probe Success Percentage:  100
    Verdict:                   Pass
  History:
    # fail experiment run count
    Failed Runs:   1
    # passed experiment run count
    Passed Runs:   1
    # stopped experiment run count
    Stopped Runs:  0
    Targets:
      # status of the chaos
      Chaos Status:  targeted
      # kind of the application
      Kind:          deployment
      # name of the application
      Name:          hello
Events:              <none>
```
