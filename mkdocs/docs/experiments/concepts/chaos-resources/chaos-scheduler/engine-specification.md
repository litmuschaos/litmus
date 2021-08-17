# Engine Specification

It embeds the ChaosEngine as a template inside schedule CR. Which contains the chaosexperiment and target application details.

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

### Engine Specification

Specify the chaosengine details at `spec.engineTemplateSpec` inside schedule CR

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-scheduler/repeat/basic-schema.yaml yaml)
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
