### Litmus Chaos Executor

- The executor runs the litmus jobs & monitors them. Typically invoked by the litmuschaos operator to run
  experiments listed in the chaosengine
- To learn more about the chaosengine & chaosexperiment resources, see [chaos operator](https://github.com/litmuschaos/chaos-operator)

### How to Override ChaosExperiment defaults 

- To override the ENV variables in the chaos experiment CRs, perform one of the below steps before applying the manifest:

  - Make changes in the ChaosExperiment CR manifest,
  
```
apiVersion: litmuschaos.io/v1alpha1
description:
  message: |
    Deletes a pod belonging to a deployment/statefulset/daemonset
kind: ChaosExperiment
metadata:
  name: kubernetes-state-pod-delete-v0.1.0
  version: 0.1.0
spec:
  definition:
    args:
    - -c
    - ansible-playbook ./experiments/chaos/kubernetes/pod_delete/test.yml -i /etc/ansible/hosts
      -vv; exit 0
    command:
    - /bin/bash
    env:
    - name: ANSIBLE_STDOUT_CALLBACK
      value: default
    - name: TOTAL_CHAOS_DURATION 
      value: 15                        <---- EDIT HERE
    - name: CHAOS_INTERVAL
      value: 5
    - name: LIB
      value: ""
    image: ""
    labels:
      name: pod-delete
    litmusbook: /experiments/chaos/kubernetes/pod_delete/run_litmus_test.yml    
```
  
  
  - Add those variables in the component spec of the respective experiments in the chaosEngine CR manifest
  
```
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
  namespace: default
spec:
  monitorenable: true 
  appinfo:
    appkind: deployment
    applabel: app=nginx
    appns: default    
  chaosServiceAccount: nginx
  experiments:
  - name: container-kill
    spec:
      components:
      - name: TARGET_CONTAINER   <------ ADD HERE  
        value: jackma
```


### Limitations

- It is unable to parse more than one configmap.

- The name of file which contains data for configmap in experimentCR should be parameters.yml

- The configmap is mount in the /mnt/ directory


  
