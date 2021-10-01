It contains probe details provided at `status.probeStatus` inside chaosresult. It contains following fields:

- `name`: Flag to show the name of probe used in the experiment
- `type`: Flag to show the type of probe used
- `status.continuous`: Flag to show the result of probe in continuous mode
- `status.prechaos`: Flag to show the result of probe in pre chaos
- `status.postchaos`: Flag to show the result of probe in post chaos

??? info "View the probe schema" 

    <table>
    <tr>
    <th>Field</th>
    <td><code>.status.probestatus.name</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to show the name of probe used in the experiment</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>n/a</i> n/a (type: string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.probestatus.name</code> shows the name of the probe used in the experiment.</td>
    </tr>
    </table>

     <table>
    <tr>
    <th>Field</th>
    <td><code>.status.probestatus.type</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to show the type of probe used</td>
    </tr>
    <tr>
    <th>Range</th>
    <td>
    <i>HTTPProbe,K8sProbe,CmdProbe</i>(type:string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.probestatus.type</code> shows the type of probe used.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.status.probestatus.status.continuous</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to show the result of probe in continuous mode</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>Awaited,Passed,Better Luck Next Time</i> (type: string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.probestatus.status.continuous</code> helps to get the result of the probe in the continuous mode. The httpProbe is better used in the Continuous mode.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.status.probestatus.status.postchaos</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to show the probe result post chaos</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>Awaited,Passed,Better Luck Next Time</i> (type:map[string]string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.probestatus.status.postchaos</code> shows the result of probe setup in EOT mode executed at the End of Test as a post-chaos check. </td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.status.probestatus.status.prechaos</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to show the probe result pre chaos</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>Awaited,Passed,Better Luck Next Time</i> (type:string)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.status.probestatus.status.prechaos</code> shows the result of probe setup in SOT mode executed at the Start of Test as a pre-chaos check.</td>
    </tr>
    </table>

view the sample example:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-result/probe-details/probe.out yaml)

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
    Failed Runs:   1
    Passed Runs:   1
    Stopped Runs:  0
    Targets:
      Chaos Status:  targeted
      Kind:          deployment
      Name:          hello
  Probe Status:
    # name of probe
    Name:  check-frontend-access-url
    # status of probe
    Status:
      Continuous:  Passed 👍 #Continuous
    # type of probe
    Type:          HTTPProbe
    # name of probe
    Name:          check-app-cluster-cr-status
    # status of probe
    Status:
      Post Chaos:  Passed 👍 #EoT
    # type of probe
    Type:          K8sProbe
    # name of probe
    Name:          check-database-integrity
    # status of probe
    Status:
      Post Chaos:  Passed 👍 #Edge
      Pre Chaos:   Passed 👍 
    # type of probe
    Type:          CmdProbe
Events:              <none>
```