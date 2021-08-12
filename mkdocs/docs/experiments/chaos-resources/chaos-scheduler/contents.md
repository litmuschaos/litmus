# Chaos Scheduler Specifications

Hold attributes for repeated execution (run now, once@timestamp, b/w start-end timestamp@ interval). Embeds the ChaosEngine as template

This section describes the fields in the ChaosScheduler and the possible values that can be set against the same.

### Schedule NOW

??? info "View the schedule now schema"

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

??? info "View the schedule once schema"

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

### Schedule Repeat

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

## Engine Specification

??? info "View the engine details"

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.engineTemplateSpec</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to control chaosengine to be formed </td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>engineTemplateSpec</code> is the ChaosEngineSpec of ChaosEngine that is to be formed.</td>
    </tr>
    </table>

## State Specification

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
