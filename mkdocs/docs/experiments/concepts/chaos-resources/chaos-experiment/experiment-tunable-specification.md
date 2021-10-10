It contains the array of tunables passed to the experiment pods as environment variables. It is used to manage the experiment execution. We can set the default values for all the variables (tunable) here which can be overridden by ChaosEngine from `.spec.experiments[].spec.components.env` if required. To know about the variables that need to be overridden check the list of "mandatory" & "optional" env for an experiment as provided within the respective experiment documentation. It can be provided at `spec.definition.env` inside chaosexperiment.

??? info "View the experiment tunables specification" 

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.env</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify env used for ChaosExperiment</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined</i> (type: {name: string, value: string})</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.env</code> specifies the array of tunables passed to the experiment pods as environment variables. It is used to manage the experiment execution. We can set the default values for all the variables (tunable) here which can be overridden by ChaosEngine from <code>.spec.experiments[].spec.components.env</code> if required. To know about the variables that need to be overridden check the list of "mandatory" & "optional" env for an experiment as provided within the respective experiment documentation.</td>
    </tr>
    </table>

Use the following example to tune this:
[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/concepts/chaos-resources/chaos-experiment/experiment-tunable/env.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
description:
  message: |
    Deletes a pod belonging to a deployment/statefulset/daemonset
kind: ChaosExperiment
metadata:
  name: pod-delete
  labels:
    name: pod-delete
    app.kubernetes.io/part-of: litmus
    app.kubernetes.io/component: chaosexperiment
    app.kubernetes.io/version: latest
spec:
  definition:
    scope: Namespaced
    # permissions for the chaosexperiment
    permissions:
      - apiGroups:
          - ""
          - "apps"
          - "apps.openshift.io"
          - "argoproj.io"
          - "batch"
          - "litmuschaos.io"
        resources:
          - "deployments"
          - "jobs"
          - "pods"
          - "pods/log"
          - "replicationcontrollers"
          - "deployments"
          - "statefulsets"
          - "daemonsets"
          - "replicasets"
          - "deploymentconfigs"
          - "rollouts"
          - "pods/exec"
          - "events"
          - "chaosengines"
          - "chaosexperiments"
          - "chaosresults"
        verbs:
          - "create"
          - "list"
          - "get"
          - "patch"
          - "update"
          - "delete"
          - "deletecollection"
    image: "litmuschaos/go-runner:latest"
    imagePullPolicy: Always
    args:
    - -c
    - ./experiments -name pod-delete
    command:
    - /bin/bash
    # it contains experiment tunables
    env:

    - name: TOTAL_CHAOS_DURATION
      value: '15'

    - name: RAMP_TIME
      value: ''

    - name: FORCE
      value: 'true'

    - name: CHAOS_INTERVAL
      value: '5'

    - name: PODS_AFFECTED_PERC
      value: ''

    - name: LIB
      value: 'litmus'    

    - name: TARGET_PODS
      value: ''

    - name: SEQUENCE
      value: 'parallel'
      
    labels:
      name: pod-delete
      app.kubernetes.io/part-of: litmus
      app.kubernetes.io/component: experiment-job
      app.kubernetes.io/version: latest
```