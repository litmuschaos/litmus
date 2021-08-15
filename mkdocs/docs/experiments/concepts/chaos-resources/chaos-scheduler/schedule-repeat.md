# Repeat Schedule

It schedule the chaos in the repeat mode. There are various ways we can set up this type of schedule by varying the the fields inside `spec.repeat`. 

`Note` - We have just one field i.e. minChaosInterval to be specified as mandatory one. All other fields are optional and totally dependent on the desired behaviour.


??? info "View the schedule repeat schema"

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.schedule.repeat.timeRange.startTime</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify start timestamp of the range within which chaos is injected, when the policy is <code>repeat</code>. The chaosengine is not created before this timestamp.</td>
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
    <td>When <code>startTime</code> is specified against the policy <code>repeat</code>, ChaosEngine will not be formed before this time, no matter when it was created.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.schedule.repeat.timeRange.endTime</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify end timestamp of the range within which chaos is injected, when the policy is <code>repeat</code>. The chaosengine is not created after this timestamp.</td>
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
    <td>When <code>endTime</code> is specified against the policy <code>repeat</code>, ChaosEngine will not be formed after this time.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.schedule.repeat.properties.minChaosInterval</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the minimum interval between two chaosengines to be formed. </td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined</i> (type: string)(pattern: "{number}m", "{number}h").</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>minChaosInterval</code> in the spec specifies a time interval that must be taken care of while repeatedly forming the chaosengines i.e. This much duration of time should be there as interval between the formation of two chaosengines. </td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.schedule.repeat.workDays.includedDays</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the days at which chaos is allowed to take place</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined</i> (type: string)(pattern: [{day_name},{day_name}...]).</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>includedDays</code> in the spec specifies a (comma-separated) list of days of the week at which chaos is allowed to take place. {day_name} is to be specified with the first 3 letters of the name of day such as <code>Mon</code>, <code>Tue</code> etc.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.schedule.repeat.workHours.includedHours</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the hours at which chaos is allowed to take place</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>{hour_number} will range from 0 to 23</i> (type: string)(pattern: {hour_number}-{hour_number}).</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>includedHours</code> in the spec specifies a range of hours of the day at which chaos is allowed to take place. 24 hour format is followed
    </tr>
    </table>

### Basic Schema to Execute Repeat Strategy

This will keep on executing the schedule and creating engines for an indefinite amount of time.

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/scheduler/mkdocs/docs/experiments/chaos-resources/chaos-scheduler/repeat/basic-schema.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosSchedule
metadata:
  name: schedule-nginx
spec:
  schedule:
    repeat:
      properties:
         #format should be like "10m" or "2h" accordingly for minutes or hours
        minChaosInterval: "2m"  
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

### Specifying Time Range for the Chaos Schedule

This will manipulate the schedule to be started and ended according to our definition.

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/scheduler/mkdocs/docs/experiments/chaos-resources/chaos-scheduler/repeat/time-range.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosSchedule
metadata:
  name: schedule-nginx
spec:
  schedule:
    repeat:
      timeRange:
        #should be modified according to current UTC Time
        startTime: "2020-05-12T05:47:00Z"   
        endTime: "2020-09-13T02:58:00Z"   
      properties:
        #format should be like "10m" or "2h" accordingly for minutes and hours
        minChaosInterval: "2m"   
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

### Specifying Just the End Time

Assumes the custom resource creation timestamp as the StartTime

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/scheduler/mkdocs/docs/experiments/chaos-resources/chaos-scheduler/repeat/just-endtime.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosSchedule
metadata:
  name: schedule-nginx
spec:
  schedule:
    repeat:
      timeRange:
        #should be modified according to current UTC Time
        endTime: "2020-09-13T02:58:00Z"   
      properties:
        #format should be like "10m" or "2h" accordingly for minutes and hours
        minChaosInterval: "2m"   
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

### Specifying Just the StartTime

Executes chaos indefinitely (until the ChaosSchedule CR is removed) starting from the specified timestamp

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/scheduler/mkdocs/docs/experiments/chaos-resources/chaos-scheduler/repeat/just-starttime.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosSchedule
metadata:
  name: schedule-nginx
spec:
  schedule:
    repeat:
      timeRange:
        #should be modified according to current UTC Time
        startTime: "2020-05-12T05:47:00Z"   
      properties:
         #format should be like "10m" or "2h" accordingly for minutes and hours
        minChaosInterval: "2m"  
  engineTemplateSpec:
    engineState: 'active'
    appinfo:
      appns: 'default'
      applabel: 'app=nginx'
      appkind: 'deployment'
    annotationCheck: 'true'
    auxiliaryAppInfo: ''
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

### Specifying Work Hours
This ensures chaos execution within the specified hours of the day, everyday.

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/scheduler/mkdocs/docs/experiments/chaos-resources/chaos-scheduler/repeat/work-hours.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosSchedule
metadata:
  name: schedule-nginx
spec:
  schedule:
    repeat:
      properties:
        #format should be like "10m" or "2h" accordingly for minutes and hours
        minChaosInterval: "2m"   
      workHours:
        # format should be <starting-hour-number>-<ending-hour-number>(inclusive)
        includedHours: 0-12
  engineTemplateSpec:
    engineState: 'active'
    appinfo:
      appns: 'default'
      applabel: 'app=nginx'
      appkind: 'deployment'
    # It can be true/false
    annotationCheck: 'true'
    #ex. values: ns1:name=percona,ns2:run=nginx
    auxiliaryAppInfo: ''
    chaosServiceAccount: pod-delete-sa
    # It can be delete/retain
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

### Specifying work days
This executes chaos on specified days of the week, with the specified minimum interval.

[embedmd]:# (https://raw.githubusercontent.com/ispeakc0de/litmus/scheduler/mkdocs/docs/experiments/chaos-resources/chaos-scheduler/repeat/work-days.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosSchedule
metadata:
  name: schedule-nginx
spec:
  schedule:
    repeat:
      properties:
        #format should be like "10m" or "2h" accordingly for minutes and hours
        minChaosInterval: "2m"   
      workDays:
        includedDays: "Mon,Tue,Wed,Sat,Sun"
  engineTemplateSpec:
    engineState: 'active'
    appinfo:
      appns: 'default'
      applabel: 'app=nginx'
      appkind: 'deployment'
    annotationCheck: 'true'
    auxiliaryAppInfo: ''
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
