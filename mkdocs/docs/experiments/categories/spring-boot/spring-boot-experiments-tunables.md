It contains the Spring Boot specific experiment tunables.

### Spring Boot request Level

It contains number of requests are to be attacked, n value means each nth request will be affected. It can be tuned by `CM_LEVEL` ENV.

Use the following example to tune this:

[embedmd]:# (./common/level.yaml yaml)
```yaml
# limits the number of requests to be attacked
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
  chaosServiceAccount: spring-boot-app-kill-sa
  experiments:
    - name: spring-boot-app-kill
      spec:
        components:
          env:
            # port of the spring boot application
            - name: CM_PORT
              value: '8080'

            # it contains the number of requests that are to be attacked.
            # n value means nth request will be affected
            - name: CM_LEVEL
              value: '1'
```


### Watch Custom Services

It contains comma seperated list of fully qualified packages(class and/or method names), which limits watched packages/classes/methods. It can be tuned by `CM_WATCHED_CUSTOM_SERVICES` ENV.

Use the following example to tune this:

[embedmd]:# (./common/watch-custom-services.yaml yaml)
```yaml
# it contains comma separated list of custom services
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
  chaosServiceAccount: spring-boot-app-kill-sa
  experiments:
    - name: spring-boot-app-kill
      spec:
        components:
          env:
            # port of the spring boot application
            - name: CM_PORT
              value: '8080'

            # it limits watched packages/classes/methods
            - name: CM_WATCHED_CUSTOM_SERVICES
              value: 'com.example.chaosdemo.controller.HelloController.sayHello,com.example.chaosdemo.service.HelloService'
```


### Watchers

It contains comma separated list of watchers from the following watchers list [controller, restController, service, repository, component, webClient]. It can be tuned by `CM_WATCHERS` ENV.

Use the following example to tune this:

[embedmd]:# (./common/watchers.yaml yaml)
```yaml
# it contains comma separated list of watchers
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
  chaosServiceAccount: spring-boot-app-kill-sa
  experiments:
    - name: spring-boot-app-kill
      spec:
        components:
          env:
            # port of the spring boot application
            - name: CM_PORT
              value: '8080'

            # provide name of watcher
            # it supports controller, restController, service, repository, component, webClient
            - name: CM_WATCHERS
              value: 'restController'
```
