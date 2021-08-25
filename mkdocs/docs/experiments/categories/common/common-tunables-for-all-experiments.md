It contains tunables, which are common for all the experiments. These tunables can be provided at `.spec.experiment[*].spec.components.env` in chaosengine.

### Duration of the chaos

It defines the total time duration of the chaos injection. It can be tuned with the `TOTAL_CHAOS_DURATION` ENV. It is provided in a unit of seconds.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/common/chaos-duration.yaml yaml)
```yaml
# define the total chaos duration
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      components:
        env:
        # time duration for the chaos execution
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Ramp Time

It defines the period to wait before and after the injection of chaos. It can be tuned with the `RAMP_TIME` ENV. It is provided in a unit of seconds.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/common/ramp-time.yaml yaml)
```yaml
# waits for the ramp time before and after injection of chaos 
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      components:
        env:
        # waits for the time interval before and after injection of chaos
        - name: RAMP_TIME
          value: '10' # in seconds
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Sequence of chaos execution

It defines the sequence of the chaos execution in the case of multiple targets. It can be tuned with the `SEQUENCE` ENV. It supports the following modes:

- `parallel`: The chaos is injected in all the targets at once.
- `serial`: The chaos is injected in all the targets one by one.
The default value of `SEQUENCE` is `parallel`.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/common/sequence.yaml yaml)
```yaml
# define the order of execution of chaos in case of multiple targets
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      components:
        env:
        # define the sequence of execution of chaos in case of mutiple targets
        # supports: serial, parallel. default: parallel
        - name: SEQUENCE
          value: 'parallel'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Name of chaos library

It defines the name of the chaos library used for the chaos injection. It can be tuned with the `LIB` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/common/lib.yaml yaml)
```yaml
# lib for the chaos injection
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      components:
        env:
        # defines the name of the chaoslib used for the experiment
        - name: LIB
          value: 'litmus'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Instance ID

It defines a user-defined string that holds metadata/info about the current run/instance of chaos. Ex: 04-05-2020-9-00. This string is appended as a suffix in the chaosresult CR name. It can be tuned with `INSTANCE_ID` ENV.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/common/instance-id.yaml yaml)
```yaml
# provide to append user-defined suffix in the end of chaosresult name
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: pod-delete-sa
  experiments:
  - name: pod-delete
    spec:
      components:
        env:
        # user-defined string appended as suffix in the chaosresult name
        - name: INSTANCE_ID
          value: '123'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```

### Image used by the helper pod

It defines the image, which is used to launch the helper pod, if applicable. It can be tuned with the `LIB_IMAGE` ENV.
It is supported by [container-kill, network-experiments, stress-experiments, dns-experiments, disk-fill, kubelet-service-kill, docker-service-kill, node-restart] experiments.

Use the following example to tune this:

[embedmd]:# (https://raw.githubusercontent.com/litmuschaos/litmus/master/mkdocs/docs/experiments/categories/common/lib-image.yaml yaml)
```yaml
# it contains the lib image used for the helper pod
# it support [container-kill, network-experiments, stress-experiments, dns-experiments, disk-fill,
# kubelet-service-kill, docker-service-kill, node-restart] experiments
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: engine-nginx
spec:
  engineState: "active"
  annotationCheck: "false"
  appinfo:
    appns: "default"
    applabel: "app=nginx"
    appkind: "deployment"
  chaosServiceAccount: container-kill-sa
  experiments:
  - name: container-kill
    spec:
      components:
        env:
        # nane of the lib image
        - name: LIB_IMAGE
          value: 'litmuschaos/go-runner:latest'
        - name: TOTAL_CHAOS_DURATION
          VALUE: '60'
```
