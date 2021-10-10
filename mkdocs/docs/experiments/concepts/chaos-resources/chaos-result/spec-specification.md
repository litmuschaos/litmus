It contains spec details provided at `spec` inside chaosresult. The name of chaosengine and chaosexperiment are present at `spec.engine` and `spec.experiment` respectively.

??? info "View the spec details schema"

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.engine</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the ChaosEngine name for the experiment</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a  (type: string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.engine<code> holds the engine name for the current course of the experiment.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.experiment</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to hold the ChaosExperiment name which induces chaos.</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>n/a (type: string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.experiment</code> holds the ChaosExperiment name for the current course of the experiment.</td>
    </tr>
    </table>

view the sample chaosresult:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-result/spec/spec.out yaml)
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
  # name of the chaosengine
  Engine:      engine-nginx
  # name of the chaosexperiment
  Experiment:  pod-delete
Status:
  Experiment Status:
    Fail Step:                 N/A
    Phase:                     Completed
    Probe Success Percentage:  100
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

