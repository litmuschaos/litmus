# Schedule Once

It schedule the chaos once either on the specified time or immediately after creation of schedule CR. 

??? info "View the schedule once schema"
    ### Schedule NOW

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.schedule.now</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to control the type of scheduling</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><code>true</code>, <code>false</code></td>
    </tr>
    <tr>
    <th>Default</th>
    <td><code>n/a</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>now</code> in the <code>spec.schedule</code> ensures immediate creation of chaosengine, i.e., injection of chaos.
    </tr>
    </table>

    ### Schedule Once

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.schedule.once.executionTime</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify execution timestamp at which chaos is injected, when the policy is <code>once</code>. The chaosengine is created exactly at this timestamp.</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined</i> (type: UTC Timeformat)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td><code>.spec.schedule.once</code> refers to a single-instance execution of chaos at a particular timestamp specified by <code>.spec.schedule.once.executionTime</code></td>
    </tr>
    </table>

### Immediate Chaos

It schedule the chaos immediately after creation of the chaos-schedule CR. It can be tuned via setting `spec.schedule.now` to `true`.

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-scheduler/once/immediate.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosSchedule
metadata:
  name: schedule-nginx
spec:
  schedule:
    now: true
  engineTemplateSpec:
    engineState: 'active'
    appinfo:
      appns: 'default'
      applabel: 'app=nginx'
      appkind: 'deployment'
    annotationCheck: 'true'
    chaosServiceAccount: pod-delete-sa
    jobCleanUpPolicy: 'delete'
    experiments:
      - name: pod-delete
        spec:
          components:
            env:
              # set chaos duration (in sec) as desired
              - name: TOTAL_CHAOS_DURATION
                value: '30'

              # set chaos interval (in sec) as desired
              - name: CHAOS_INTERVAL
                value: '10'

              # pod failures without '--force' & default terminationGracePeriodSeconds
              - name: FORCE
                value: 'false'
```

### Chaos at a Specified TimeStamp

It schedule the chaos once at the specified time. It can be tuned via setting `spec.schedule.once.executionTime`. The execution time should be in `UTC Timezone`. 

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-scheduler/once/specific-time.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosSchedule
metadata:
  name: schedule-nginx
spec:
  schedule:
    once:
      #should be modified according to current UTC Time
      executionTime: "2020-05-12T05:47:00Z"   
  engineTemplateSpec:
    engineState: 'active'
    appinfo:
      appns: 'default'
      applabel: 'app=nginx'
      appkind: 'deployment'
    annotationCheck: 'true'
    chaosServiceAccount: pod-delete-sa
    jobCleanUpPolicy: 'delete'
    experiments:
      - name: pod-delete
        spec:
          components:
            env:
              # set chaos duration (in sec) as desired
              - name: TOTAL_CHAOS_DURATION
                value: '30'

              # set chaos interval (in sec) as desired
              - name: CHAOS_INTERVAL
                value: '10'

              # pod failures without '--force' & default terminationGracePeriodSeconds
              - name: FORCE
                value: 'false'
```
