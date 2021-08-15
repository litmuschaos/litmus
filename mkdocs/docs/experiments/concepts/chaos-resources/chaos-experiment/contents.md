# Chaos Experiment Specifications

Granular definition of chaos intent specified via image, librar, necessary permissions, low-level chaos parameters (default values).

This section describes the fields in the ChaosExperiment and the possible values that can be set against the same.

### Scope Specification

??? info "View the scope schema" 

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.scope</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the scope of the ChaosExperiment</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><code>Namespaced</code>, <code>Cluster</code></td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i> (depends on experiment type)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.definition.scope</code> specifies the scope of the experiment. It can be <code>Namespaced</code> scope for pod level experiments and <code>Cluster</code> for the experiments having a cluster wide impact.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.permissions</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the minimum permission to run the ChaosExperiment</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined</i> (type: list)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.definition.permissions</code> specify the minimum permission that is required to run the ChaosExperiment. It also helps to estimate the blast radius for the ChaosExperiment.</td>
    </tr>
    </table>

### Component Specification

??? info "View the component schema" 

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.image</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the image to run the ChaosExperiment </td>
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
    <td><i>n/a</i> (refer Notes)</td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.definition.image</code> allows the developers to specify their experiment images. Typically set to the Litmus <code>go-runner</code> or the <code>ansible-runner</code>. This feature of the experiment enables BYOC (BringYourOwnChaos), where developers can implement their own variants of a standard chaos experiment</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.imagePullPolicy</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag that helps the developers to specify imagePullPolicy for the ChaosExperiment</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><code>IfNotPresent</code>, <code>Always</code> (type: string)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><code>Always</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.definition.imagePullPolicy</code> allows developers to specify the pull policy for ChaosExperiment image. Set to <code>Always</code> during debug/test</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.args</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the entrypoint for the ChaosExperiment</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined</i> (type:list of string)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.definition.args</code> specifies the entrypoint for the ChaosExperiment. It depends on the language used in the experiment. For litmus-go the <code>.spec.definition.args</code> contains a single binary of all experiments and managed via <code>-name</code> flag to indicate experiment to run(<code>-name (exp-name)</code>).</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.command</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the shell on which the ChaosExperiment will execute</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Mandatory</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined</i> (type: list of string).</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><code>/bin/bash</code></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.definition.command</code> specifies the shell used to run the experiment <code>/bin/bash</code> is the most common shell to be used.</td>
    </tr>
    </table>

### Experiment Tunables Specification

??? info "View the experiment tunables" 

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

### Configuration Specification

??? info "View the configuration schema"

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.securityContext.containerSecurityContext.privileged</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the security context for the ChaosExperiment pod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>true, false</i> (type:bool)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td>The <code>.spec.definition.securityContext.containerSecurityContext.privileged</code> specify the securityContext params to the experiment container.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.labels</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the label for the ChaosPod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined<i> (type:map[string]string)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.labels</code> allow developers to specify the ChaosPod label for an experiment. </td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.securityContext.podSecurityContext</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify security context for ChaosPod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined<i> (type:corev1.PodSecurityContext)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.securityContext.podSecurityContext</code> allows the developers to specify the security context for the ChaosPod which applies to all containers inside the Pod.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.configMaps</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the configmap for ChaosPod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined<i></td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.configMaps</code> allows the developers to mount the ConfigMap volume into the experiment pod.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.secrets</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the secrets for ChaosPod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined<i></td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.secrets</code> specify the secret data to be passed for the ChaosPod. The secrets typically contains confidential information like credentials.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.experimentAnnotations</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the custom annotation to the ChaosPod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined<i> (type:map[string]string)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.experimentAnnotations</code> allows the developer to specify the Custom annotation for the chaos pod.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.hostFileVolumes</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the host file volumes to the ChaosPod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>user-defined<i> (type:map[string]string)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.hostFileVolumes</code> allows the developer to specify the host file volumes to the ChaosPod.</td>
    </tr>
    </table>

    <table>
    <tr>
    <th>Field</th>
    <td><code>.spec.definition.hostPID</code></td>
    </tr>
    <tr>
    <th>Description</th>
    <td>Flag to specify the host PID for the ChaosPod</td>
    </tr>
    <tr>
    <th>Type</th>
    <td>Optional</td>
    </tr>
    <tr>
    <th>Range</th>
    <td><i>true, false</i> (type:bool)</td>
    </tr>
    <tr>
    <th>Default</th>
    <td><i>n/a</i></td>
    </tr>
    <tr>
    <th>Notes</th>
    <td> The <code>.spec.definition.hostPID</code> allows the developer to specify the host PID  for the ChaosPod. </td>
    </tr>
    </table>