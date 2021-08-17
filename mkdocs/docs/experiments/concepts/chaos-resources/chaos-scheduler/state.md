# Halt/Resume ChaosSchedule

Chaos Schedules can be `halted` or `resumed` as per need. It can tuned via setting `spec.scheduleState` to `halt` and `active` respectively. 

??? info "View the state schema"

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.scheduleState</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to control chaosshedule state </td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><code>active</code>, <code>halt</code>, <code>complete</code></td>
    </tr>
    <tr>
    <th>Default</th>
    <td><code>active</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>scheduleState</code> is the current state of ChaosSchedule. If the schedule is running its state will be <code>active</code>, if the schedule is halted its state will be <code>halt</code> and if the schedule is completed it state will be <code>complete</code>.</td>
    </tr>
    </table>

#### Halt The Schedule

Follow the below steps to halt the active schedule:

- Edit the ChaosSchedule CR in your favourite editor
```
kubectl edit chaosschedule schedule-nginx
```
- Change the spec.scheduleState to halt
```
spec:
  scheduleState: halt
```

#### Resume The Schedule

Follow the below steps to resume the halted schedule:

- Edit the chaosschedule
```
kubectl edit chaosschedule schedule-nginx
```
- Change the spec.scheduleState to active
```
spec:
  scheduleState: active
```
