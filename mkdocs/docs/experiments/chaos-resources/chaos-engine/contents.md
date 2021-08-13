# Chaos Engine Specifications

Bind an instance of a given app with one or more chaos experiments, define run characteristics, override chaos defaults, define steady-state hypothesis, reconciled by Litmus Chaos Operator.

This section describes the fields in the ChaosEngine spec and the possible values that can be set against the same.

<table>
  <tr>
    <th>Field Name</th>
    <th>Description</th>
    <th>User Guide</th>
  </tr>
  <tr>
  <td>State Specification</td>
  <td>It defines the state of the chaosengine</td>
  <td><a href="/litmus/experiments/chaos-resources/chaos-engine/engine-state">State Specifications</a></td>
  </tr>
  <tr>
  <td>Application Specification</td>
  <td>It defines the details of AUT and auxiliary applications</td>
  <td><a href="/litmus/experiments/chaos-resources/chaos-engine/application-details">Application Specifications</a></td>
  </tr>
  <tr>
  <td>RBAC Specification</td>
  <td>It defines the chaos-service-account name</td>
  <td><a href="/litmus/experiments/chaos-resources/chaos-engine/rbac-details">RBAC Specifications</a></td>
  </tr>
  <tr>
  <td>Runtime Specification</td>
  <td>It defines the runtime details of the chaosengine</td>
  <td><a href="/litmus/experiments/chaos-resources/chaos-engine/runtime-details">Runtime Specifications</a></td>
  </tr>
  <tr>
  <td>Runner Specification</td>
  <td>It defines the runner pod specifications</td>
  <td><a href="/litmus/experiments/chaos-resources/chaos-engine/runner-components">Runner Specifications</a></td>
  </tr>
  <tr>
  <td>Experiment Specification</td>
  <td>It defines the experiment pod specifications</td>
  <td><a href="/litmus/experiments/chaos-resources/chaos-engine/experiment-components">Experiment Specifications</a></td>
  </tr>
</table>

### State Specification

??? info "View the state specification schema" 

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.engineState</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Flag to control the state of the chaosengine</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Mandatory</td>
    </tr>
    <tr>
      <th>Range</th>
      <td><code>active</code>, <code>stop</code></td>
    </tr>
    <tr>
      <th>Default</th>
      <td><code>active</code></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>engineState</code> in the spec is a user defined flag to trigger chaos. Setting it to <code>active</code> ensures successful execution of chaos. Patching it with <code>stop</code> aborts ongoing experiments. It has a corresponding flag in the chaosengine status field, called <code>engineStatus</code> which is updated by the controller based on actual state of the ChaosEngine.</td>
    </tr>
    </table>

### Application Specification

??? info "View the application specification schema" 

    <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.appinfo.appns</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to specify namespace of application under test</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Optional</td>
      </tr>
      <tr>
        <th>Range</th>
        <td><i>user-defined</i> (type: string)</td>
      </tr>
      <tr>
        <th>Default</th>
        <td><i>n/a</i></td>
      </tr>
      <tr>
        <th>Notes</th>
        <td>The <code>appns</code> in the spec specifies the namespace of the AUT. Usually provided as a quoted string. It is optional for the infra chaos.</td>
      </tr>
      </table>

      <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.appinfo.applabel</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to specify unique label of application under test</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Optional</td>
      </tr>
      <tr>
        <th>Range</th>
        <td><i>user-defined</i> (type: string)(pattern: "label_key=label_value")</td>
      </tr>
      <tr>
        <th>Default</th>
        <td><i>n/a</i></td>
      </tr>
      <tr>
        <th>Notes</th>
        <td>The <code>applabel</code> in the spec specifies a unique label of the AUT. Usually provided as a quoted string of pattern key=value. Note that if multiple applications share the same label within a given namespace, the AUT is filtered based on the presence of the chaos annotation <code>litmuschaos.io/chaos: "true"</code>. If, however, the <code>annotationCheck</code> is disabled, then a random application (pod) sharing the specified label is selected for chaos. It is optional for the infra chaos.</td>
      </tr>
      </table>

      <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.appinfo.appkind</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to specify resource kind of application under test</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Optional</td>
      </tr>
      <tr>
        <th>Range</th>
        <td><code>deployment</code>, <code>statefulset</code>, <code>daemonset</code>, <code>deploymentconfig</code>, <code>rollout</code></td>
      </tr>
      <tr>
        <th>Default</th>
        <td><i>n/a</i> (depends on app type)</td>
      </tr>
      <tr>
        <th>Notes</th>
        <td>The <code>appkind</code> in the spec specifies the Kubernetes resource type of the app deployment. The Litmus ChaosOperator supports chaos on deployments, statefulsets and daemonsets. Application health check routines are dependent on the resource types, in case of some experiments. It is optional for the infra chaos</td>
      </tr>
      </table>

      <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.auxiliaryAppInfo</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to specify one or more app namespace-label pairs whose health is also monitored as part of the chaos experiment, in addition to a primary application specified in the <code>.spec.appInfo</code>. <b>NOTE</b>: If the auxiliary applications are deployed in namespaces other than the AUT, ensure that the chaosServiceAccount is bound to a cluster role and has adequate permissions to list pods on other namespaces. </td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Optional</td>
      </tr>
      <tr>
        <th>Range</th>
        <td><i>user-defined</i> (type: string)(pattern: "namespace:label_key=label_value").</td>
      </tr>
      <tr>
        <th>Default</th>
        <td><i>n/a</i></td>
      </tr>
      <tr>
        <th>Notes</th>
        <td>The <code>auxiliaryAppInfo</code> in the spec specifies a (comma-separated) list of namespace-label pairs for downstream (dependent) apps of the primary app specified in <code>.spec.appInfo</code> in case of pod-level chaos experiments. In case of infra-level chaos experiments, this flag specifies those apps that may be directly impacted by chaos and upon which health checks are necessary.</td>
      </tr>
      </table>
 
### RBAC Specification

??? info "View the RBAC specification schema"
    <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.chaosServiceAccount</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to specify serviceaccount used for chaos experiment</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Mandatory</td>
      </tr>
      <tr>
        <th>Range</th>
        <td><i>user-defined</i> (type: string)</td>
      </tr>
      <tr>
        <th>Default</th>
        <td><i>n/a</i></td>
      </tr>
      <tr>
        <th>Notes</th>
        <td>The <code>chaosServiceAccount</code> in the spec specifies the name of the serviceaccount mapped to a role/clusterRole with enough permissions to execute the desired chaos experiment. The minimum permissions needed for any given experiment is provided in the <code>.spec.definition.permissions</code> field of the respective <b>chaosexperiment</b> CR.</td>
      </tr>
    </table>

### Runtime Specification

??? info "View the runtime specification schema"

    <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.annotationCheck</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to control annotationChecks on applications as prerequisites for chaos</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Optional</td>
      </tr>
      <tr>
        <th>Range</th>
        <td><code>true</code>, <code>false</code></td>
      </tr>
      <tr>
        <th>Default</th>
        <td><code>true</code></td>
      </tr>
      <tr>
        <th>Notes</th>
        <td>The <code>annotationCheck</code> in the spec controls whether or not the operator checks for the annotation "litmuschaos.io/chaos" to be set against the application under test (AUT). Setting it to <code>true</code> ensures the check is performed, with chaos being skipped if the app is not annotated, while setting it to <code>false</code> suppresses this check and proceeds with chaos injection.</td>
      </tr>
      </table>

      <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.terminationGracePeriodSeconds</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to control terminationGracePeriodSeconds for the chaos pods(abort case)</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Optional</td>
      </tr>
      <tr>
        <th>Range</th>
        <td>integer value</td>
      </tr>
      <tr>
        <th>Default</th>
        <td><code>30</code></td>
      </tr>
      <tr>
        <th>Notes</th>
        <td>The <code>terminationGracePeriodSeconds</code> in the spec controls the terminationGracePeriodSeconds for the chaos resources in abort case. Chaos pods contains chaos revert upon abortion steps, which continuously looking for the termination signals. The terminationGracePeriodSeconds should be provided in such a way that the chaos pods got enough time for the revert before completely terminated.</td>
      </tr>
      </table>


      <table>
      <tr>
        <th>Field</th>
        <td><code>.spec.jobCleanUpPolicy</code></td>
      </tr>
      <tr>
        <th>Description</th>
        <td>Flag to control cleanup of chaos experiment job post execution of chaos</td>
      </tr>
      <tr>
        <th>Type</th>
        <td>Optional</td>
      </tr>
      <tr>
        <th>Range</th>
        <td><code>delete</code>, <code>retain</code></td>
      </tr>
      <tr>
        <th>Default</th>
        <td><code>delete</code></td>
      </tr>
      <tr>
        <th>Notes</th>
        <td><The <code>jobCleanUpPolicy</code> controls whether or not the experiment pods are removed once execution completes. Set to <code>retain</code> for debug purposes (in the absence of standard logging mechanisms).</td>
      </tr>
    </table>

### Runner Specification

??? info "View the runner specification schema"

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.image</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Flag to specify image of ChaosRunner pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
      <td><i>user-defined</i> (type: string)</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i> (refer <i>Notes</i>)</td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.components.runner.image</code> allows developers to specify their own debug runner images. Defaults for the runner image can be enforced via the operator env <b>CHAOS_RUNNER_IMAGE</b></td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.imagePullPolicy</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Flag to specify imagePullPolicy for the ChaosRunner</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><code>Always</code>, <code>IfNotPresent</code></td>
    </tr>
    <tr>
      <th>Default</th>
      <td><code>IfNotPresent</code></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.components.runner.imagePullPolicy</code> allows developers to specify the pull policy for chaos-runner. Set to <code>Always</code> during debug/test.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.imagePullSecrets</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Flag to specify imagePullSecrets for the ChaosRunner</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: []corev1.LocalObjectReference)</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.components.runner.imagePullSecrets</code> allows developers to specify the <code>imagePullSecret</code> name for ChaosRunner. </td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.runnerAnnotations</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Annotations that needs to be provided in the pod which will be created (runner-pod)</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td> <i>user-defined</i> (type: map[string]string) </td>
    </tr>
    <tr>
      <th>Default</th>
      <td> n/a </td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.components.runner.runnerAnnotation</code> allows developers to specify the custom annotations for the runner pod.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.args</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Specify the args for the ChaosRunner Pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
      <td><i>user-defined</i> (type: []string)</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.components.runner.args</code> allows developers to specify their own debug runner args.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.command</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Specify the commands for the ChaosRunner Pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
      <td><i>user-defined</i> (type: []string)</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.components.runner.command</code> allows developers to specify their own debug runner commands.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.configMaps</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Configmaps passed to the chaos runner pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: {name: string, mountPath: string})</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.spec.components.runner.configMaps</code> provides for a means to insert config information into the runner pod.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.secrets</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Kubernetes secrets passed to the chaos runner pod.</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: {name: string, mountPath: string})</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.spec.components.runner.secrets</code> provides for a means to push secrets (typically project ids, access credentials etc.,) into the chaos runner pod. These are especially useful in case of platform-level/infra-level chaos experiments. </td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.nodeSelector</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Node selectors for the runner pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td>Labels in the from of label key=value</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.spec.components.runner.nodeSelector</code> The nodeselector contains labels of the node on which runner pod should be scheduled. Typically used in case of infra/node level chaos.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.resources</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Specify the resource requirements for the ChaosRunner pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: corev1.ResourceRequirements)</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.spec.components.runner.resources</code> contains the resource requirements for the ChaosRunner Pod, where we can provide resource requests and limits for the pod.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.components.runner.tolerations</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Toleration for the runner pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: []corev1.Toleration)</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.spec.components.runner.tolerations</code> Provides tolerations for the runner pod so that it can be scheduled on the respective tainted node. Typically used in case of infra/node level chaos.</td>
    </tr>
    </table>

### Experiment Specification

??? info "View the experiment specification schema"

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.experiments[].spec.components.configMaps</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Configmaps passed to the chaos experiment</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: {name: string, mountPath: string})</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>experiment[].spec.components.configMaps</code> provides for a means to insert config information into the experiment. The configmaps definition is validated for correctness and those specified are checked for availability (in the cluster/namespace) before being mounted into the experiment pods.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.experiments[].spec.components.secrets</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Kubernetes secrets passed to the chaos experiment</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: {name: string, mountPath: string})</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>experiment[].spec.components.secrets</code> provides for a means to push secrets (typically project ids, access credentials etc.,) into the experiment pods. These are especially useful in case of platform-level/infra-level chaos experiments. The secrets definition is validated for correctness and those specified are checked for availability (in the cluster/namespace) before being mounted into the experiment pods.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.experiments[].spec.components.experimentImage</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Override the image of the chaos experiment</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i> string </i></td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>experiment[].spec.components.experimentImage</code> overrides the experiment image for the chaoexperiment.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.experiments[].spec.components.experimentImagePullSecrets</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Flag to specify imagePullSecrets for the ChaosExperiment</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: []corev1.LocalObjectReference)</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.components.runner.experimentImagePullSecrets</code> allows developers to specify the <code>imagePullSecret</code> name for ChaosExperiment. </td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.experiments[].spec.components.nodeSelector</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Provide the node selector for the experiment pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i> Labels in the from of label key=value</i></td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>experiment[].spec.components.nodeSelector</code> The nodeselector contains labels of the node on which experiment pod should be scheduled. Typically used in case of infra/node level chaos.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.experiments[].spec.components.statusCheckTimeouts</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Provides the timeout and retry values for the status checks. Defaults to 180s & 90 retries (2s per retry)</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i> It contains values in the form {delay: int, timeout: int} </i></td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>delay: 2s and timeout: 180s</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>experiment[].spec.components.statusCheckTimeouts</code> The statusCheckTimeouts override the status timeouts inside chaosexperiments. It contains timeout & delay in seconds.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.experiments[].spec.components.resources</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Specify the resource requirements for the ChaosExperiment pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: corev1.ResourceRequirements)</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>experiment[].spec.components.resources</code> contains the resource requirements for the ChaosExperiment Pod, where we can provide resource requests and limits for the pod.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.experiments[].spec.components.experimentAnnotations</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Annotations that needs to be provided in the pod which will be created (experiment-pod)</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td> <i>user-defined</i> (type: label key=value) </td>
    </tr>
    <tr>
      <th>Default</th>
      <td> n/a </td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.spec.components.experimentAnnotation</code> allows developers to specify the custom annotations for the experiment pod.</td>
    </tr>
    </table>

    <table>
    <tr>
      <th>Field</th>
      <td><code>.spec.experiments[].spec.components.tolerations</code></td>
    </tr>
    <tr>
      <th>Description</th>
      <td>Toleration for the experiment pod</td>
    </tr>
    <tr>
      <th>Type</th>
      <td>Optional</td>
    </tr>
    <tr>
      <th>Range</th>
    <td><i>user-defined</i> (type: []corev1.Toleration)</td>
    </tr>
    <tr>
      <th>Default</th>
      <td><i>n/a</i></td>
    </tr>
    <tr>
      <th>Notes</th>
      <td>The <code>.spec.components.tolerations</code>Tolerations for the experiment pod so that it can be scheduled on the respective tainted node. Typically used in case of infra/node level chaos.</td>
    </tr>
    </table>
