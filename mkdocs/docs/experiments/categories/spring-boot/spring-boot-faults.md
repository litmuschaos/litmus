## Introduction

- It can target random pods with a Spring Boot application and allows configuring the assaults to inject multiple spring boot faults simultaneously on the target pod.
- It supports `app-kill`, `cpu-stress`, `memory-stress`, `latency`, and `exceptions` faults
!!! tip "Scenario: Inject Spring Boot Faults"    
    ![Spring Boot Faults](../../images/spring-boot-chaos.png)

## Uses

??? info "View the uses of the experiment" 
    coming soon

## Prerequisites

??? info "Verify the prerequisites" 
    <ul>
        <li> Ensure that Kubernetes Version > 1.16 </li>
        <li>Ensure that the Litmus Chaos Operator is running by executing <code>kubectl get pods</code> in operator namespace (typically, <code>litmus</code>).If not, install from <a href="https://v1-docs.litmuschaos.io/docs/getstarted/#install-litmus">here</a> </li>
        <li> Ensure that the <code> spring-boot-faults </code> experiment resource is available in the cluster by executing <code>kubectl get chaosexperiments</code> in the desired namespace. If not, install from <a href="https://hub.litmuschaos.io/api/chaos/master?file=faults/spring-boot/spring-boot-faults/fault.yaml">here</a></li>
        <li>Chaos Monkey Spring Boot dependency should be present in application. It can be enabled by two ways:
          <ol>
            <li>Add internal dependency inside the spring boot application
                <ol>
                    <li>Add Chaos Monkey for Spring Boot as dependency for your project
                        ```maven
                        <dependency>
                            <groupId>de.codecentric</groupId>
                            <artifactId>chaos-monkey-spring-boot</artifactId>
                            <version>2.6.1</version>
                        </dependency>
                        ```
                    </li>
                    <li> Start your Spring Boot App with the chaos-monkey spring profile enabled
                        ```bash
                        java -jar your-app.jar --spring.profiles.active=chaos-monkey --chaos.monkey.enabled=true
                        ```
                    </li>
                </ol> 
            </li>
            <li> Add as external dependency
                <ol>
                    <li>You can extend your existing application with the chaos-monkey and add it as an external dependency at startup, for this it is necessary to use the PropertiesLauncher of Spring Boot
                        ```maven
                        <dependency>
                            <groupId>de.codecentric</groupId>
                            <artifactId>chaos-monkey-spring-boot</artifactId>
                            <classifier>jar-with-dependencies</classifier>
                            <version>2.6.1</version>
                        </dependency>
                        ```
                    </li>
                    <li>Start your Spring Boot application, add Chaos Monkey for Spring Boot JAR and properties
                        ```bash
                        java -cp your-app.jar -Dloader.path=chaos-monkey-spring-boot-2.6.1-jar-with-dependencies.jar org.springframework.boot.loader.PropertiesLauncher --spring.profiles.active=chaos-monkey --spring.config.location=file:./chaos-monkey.properties
                        ```
                    </li>
                </ol>
            </li>
          </ol>
        </li>
    </ul>

## Default Validations

??? info "View the default validations" 
    - Spring boot pods are healthy before and after chaos injection

## Minimal RBAC configuration example (optional)

!!! tip "NOTE"   
    If you are using this experiment as part of a litmus workflow scheduled constructed & executed from chaos-center, then you may be making use of the [litmus-admin](https://litmuschaos.github.io/litmus/litmus-admin-rbac.yaml) RBAC, which is pre-installed in the cluster as part of the agent setup.

    ??? note "View the Minimal RBAC permissions"

        ```yaml
        apiVersion: v1
        kind: ServiceAccount
        metadata:
          name: spring-boot-faults-sa
          namespace: default
          labels:
            name: spring-boot-faults-sa
            app.kubernetes.io/part-of: litmus
        ---
        apiVersion: rbac.authorization.k8s.io/v1
        kind: Role
        metadata:
          name: spring-boot-faults-sa
          namespace: default
          labels:
            name: spring-boot-faults-sa
            app.kubernetes.io/part-of: litmus
        rules:
          # Create and monitor the experiment & helper pods
          - apiGroups: [""]
            resources: ["pods"]
            verbs: ["create","delete","get","list","patch","update", "deletecollection"]
          # Performs CRUD operations on the events inside chaosengine and chaosresult
          - apiGroups: [""]
            resources: ["events"]
            verbs: ["create","get","list","patch","update"]
          # Track and get the runner, experiment, and helper pods log 
          - apiGroups: [""]
            resources: ["pods/log"]
            verbs: ["get","list","watch"]
          # for creating and managing to execute commands inside target container
          - apiGroups: [""]
            resources: ["pods/exec"]
            verbs: ["get","list","create"]
          # for configuring and monitor the experiment job by the chaos-runner pod
          - apiGroups: ["batch"]
            resources: ["jobs"]
            verbs: ["create","list","get","delete","deletecollection"]
          # for creation, status polling and deletion of litmus chaos resources used within a chaos workflow
          - apiGroups: ["litmuschaos.io"]
            resources: ["chaosengines","chaosexperiments","chaosresults"]
            verbs: ["create","list","get","patch","update","delete"]
        ---
        apiVersion: rbac.authorization.k8s.io/v1
        kind: RoleBinding
        metadata:
          name: spring-boot-faults-sa
          namespace: default
          labels:
            name: spring-boot-faults-sa
            app.kubernetes.io/part-of: litmus
        roleRef:
          apiGroup: rbac.authorization.k8s.io
          kind: Role
          name: spring-boot-faults-sa
        subjects:
          - kind: ServiceAccount
            name: spring-boot-faults-sa
            namespace: default
        ```
        Use this sample RBAC manifest to create a chaosServiceAccount in the desired (app) namespace. This example consists of the minimum necessary role permissions to execute the experiment.

## Experiment tunables

??? info "check the experiment tunables"

    <h2>Mandatory Fields</h2>

    <table>
      <tr>
        <th> Variables </th>
        <th> Description </th>
        <th> Notes </th>
      </tr>
      <tr>
        <td> CM_PORT </td>
        <td> It contains port of the spring boot application </td>
        <td> </td>
      </tr>
      <tr>
        <td> CM_KILL_APPLICATION_ACTIVE </td>
        <td> It enable the app-kill faults</td>
        <td> It supports boolean values. Default is false</td>
      </tr>
      <tr>
        <td> CM_LATENCY_ACTIVE </td>
        <td> It enable the latency faults</td>
        <td> It supports boolean values. Default is false</td>
      </tr>
      <tr>
        <td> CM_MEMORY_ACTIVE </td>
        <td> It enable the memory stress faults</td>
        <td> It supports boolean values. Default is false</td>
      </tr>
      <tr>
        <td> CM_CPU_ACTIVE </td>
        <td> It enable the cpu stress faults</td>
        <td> It supports boolean values. Default is false</td>
      </tr>
      <tr>
        <td> CM_EXCEPTIONS_ACTIVE </td>
        <td> It enable the exceptions faults</td>
        <td> It supports boolean values. Default is false</td>
      </tr>
      <tr>
        <td> CPU_LOAD_FRACTION </td>
        <td> It contains fraction of cpu to be stressed, 0.95 equals 95%</td>
        <td> default value is 0.9. It supports value in range [0.1,1.0]</td>
      </tr>
      <tr>
        <td> CM_EXCEPTIONS_TYPE </td>
        <td> It contains type of raised exception </td>
        <td> Defaults value: <code> java.lang.IllegalArgumentException </code> </td>
      </tr>
       <tr>
        <td> CM_EXCEPTIONS_ARGUMENTS </td>
        <td> It contains argument of raised exception </td>
        <td> Defaults value: <code> java.lang.String:custom illegal argument exception </code> </td>
      </tr>
      <tr>
        <td> LATENCY </td>
        <td> It contains network latency to be injected(in ms)</td>
        <td> default value is 2000</td>
      </tr>
      <tr>
        <td> MEMORY_FILL_FRACTION </td>
        <td> It contains fraction of memory to be stressed, 0.7 equals 70%</td>
        <td> default value is 0.70. It supports value in range [0.01,0.95]</td>
      </tr>
    </table>
    
    <h2>Optional Fields</h2>

    <table>
      <tr>
        <th> Variables </th>
        <th> Description </th>
        <th> Notes </th>
      </tr>
      <tr>
        <td> CM_LEVEL </td>
        <td> It contains number of requests are to be attacked, n value means nth request will be affected </td>
        <td> Defaults value: 1, it lies in [1,10000] range </td>
      </tr>
      <tr>
        <td> CM_WATCHED_CUSTOM_SERVICES </td>
        <td> It limits watched packages/classes/methods, it contains comma seperated list of fully qualified packages(class and/or method names)</td>
        <td> ByDefault it is empty list, which means it target all services </td>
      </tr>
      <tr>
        <td> CM_WATCHERS </td>
        <td> It contains comma separated list of watchers from the following watchers list [controller, restController, service, repository, component, webClient] </td>
        <td> ByDefault it is <code> restController </code></td>
      </tr>
      <tr>
        <td> TOTAL_CHAOS_DURATION </td>
        <td> The time duration for chaos injection (seconds) </td>
        <td> Defaults to 30 </td>
      </tr>
      <tr>
        <td> SEQUENCE </td>
        <td> It defines sequence of chaos execution for multiple target pods </td>
        <td> Default value: parallel. Supported: serial, parallel </td>
      </tr>
      <tr>
        <td> PODS_AFFECTED_PERC </td>
        <td> The Percentage of total pods to target  </td>
        <td> Defaults to 0% (corresponds to 1 replica) </td>
      </tr>
      <tr>
        <td> LIB </td>
        <td> The chaos lib used to inject the chaos </td>
        <td> Defaults to <code>litmus</code>. Supported <code>litmus</code> only </td>
      </tr>
      <tr>
        <td> RAMP_TIME </td>
        <td> Period to wait before and after injection of chaos in sec </td>
        <td> </td>
      </tr>
    </table>

## Experiment Examples

### Common Experiment Tunables

Refer the [common attributes](../common/common-tunables-for-all-experiments.md) and  [Spring Boot specific tunable](spring-boot-experiments-tunables.md) to tune the common tunables for all experiments and spring-boot specific tunables.

### Inject Multiple Faults Simultaneously (CPU, Latency and Exceptions)

It injects cpu, latency, and exceptions faults simultaneously on the target pods

Use the following example to tune this:

[embedmd]:# (./spring-boot-faults/cpu-latency-exceptions-faults.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: spring-boot-chaos
  namespace: default
spec:
  appinfo:
    appns: 'default'
    applabel: 'app=spring-boot'
    appkind: 'deployment'
  # It can be active/stop
  engineState: 'active'
  chaosServiceAccount: spring-boot-faults-sa
  experiments:
    - name: spring-boot-faults
      spec:
        components:
          env:
            # set chaos duration (in sec) as desired
            - name: TOTAL_CHAOS_DURATION
              value: '30'

            # port of the spring boot application
            - name: CM_PORT
              value: '8080'

            # it enables spring-boot latency fault
            - name: CM_LATENCY_ACTIVE
              value: 'true'

            # provide the latency (ms)
            # it is applicable when latency is active
            - name: LATENCY
              value: '2000'

            # it enables spring-boot cpu stress fault
            - name: CM_CPU_ACTIVE
              value: 'true'

            # it contains fraction of cpu to be stressed(0.95 equals 95%)
            # it supports value in range [0.1,1.0]
            # it is applicable when cpu is active
            - name: CPU_LOAD_FRACTION
              value: '0.9'

            # it enables spring-boot exceptions fault
            - name: CM_EXCEPTIONS_ACTIVE
              value: 'true'

            # Type of raised exception
            # it is applicable when exceptions is active
            - name: CM_EXCEPTIONS_TYPE
              value: 'java.lang.IllegalArgumentException'

              # Argument of raised exception
              # it is applicable when exceptions is active
            - name: CM_EXCEPTIONS_ARGUMENTS
              value: 'java.lang.String:custom illegal argument exception'

            ## percentage of total pods to target
            - name: PODS_AFFECTED_PERC
              value: ''
              
```


### Inject Multiple Faults Simultaneously (Appkill and Memory)

It injects appkill and memory stress faults simultaneously on the target pods

Use the following example to tune this:

[embedmd]:# (./spring-boot-faults/appkill-memory-faults.yaml yaml)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: spring-boot-chaos
  namespace: default
spec:
  appinfo:
    appns: 'default'
    applabel: 'app=spring-boot'
    appkind: 'deployment'
  # It can be active/stop
  engineState: 'active'
  chaosServiceAccount: spring-boot-faults-sa
  experiments:
    - name: spring-boot-faults
      spec:
        components:
          env:
            # set chaos duration (in sec) as desired
            - name: TOTAL_CHAOS_DURATION
              value: '30'

            # port of the spring boot application
            - name: CM_PORT
              value: '8080'

            # it enables spring app-kill fault
            - name: CM_KILL_APPLICATION_ACTIVE
              value: 'true'

            # it enables spring-boot memory stress fault
            - name: CM_MEMORY_ACTIVE
              value: ''

            # it contains fraction of memory to be stressed(0.70 equals 70%)
            # it supports value in range [0.01,0.95]
            # it is applicable when memory is active
            - name: MEMORY_FILL_FRACTION
              value: '0.70'
            
            ## percentage of total pods to target
            - name: PODS_AFFECTED_PERC
              value: ''
              
```
