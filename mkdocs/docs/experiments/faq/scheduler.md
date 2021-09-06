---
hide:
  - toc
---
# Chaos Scheduler

## Table of Contents

1. [What is ChaosScheduler?](#what-is-chaosscheduler)

1. [How is ChaosScheduler different from ChaosOperator?](#how-is-chaosscheduler-different-from-chaosoperator)

1. [What are the pre-requisites for ChaosScheduler?](#what-are-the-pre-requisites-for-chaosscheduler)

1. [How to install ChaosScheduler?](#how-to-install-chaosscheduler)

1. [How to schedule the chaos using ChaosScheduler?](#how-to-schedule-the-chaos-using-chaosscheduler)

1. [What are the different techniques of scheduling the chaos?](#what-are-the-different-techniques-of-scheduling-the-chaos)

1. [What fields of spec.schedule are to be specified with spec.schedule.type=now?](#what-fields-of-specschedule-are-to-be-specified-with-specscheduletypenow)

1. [What fields of spec.schedule are to be specified with spec.schedule.type=once?](#what-fields-of-specschedule-are-to-be-specified-with-specscheduletypeonce)

1. [What fields of spec.schedule are to be specified with spec.schedule.type=repeat?](#what-fields-of-specschedule-are-to-be-specified-with-specscheduletyperepeat)

1. [How to run ChaosScheduler in Namespaced mode?](#how-to-run-chaosscheduler-in-namespaced-mode)

### What is ChaosScheduler?

ChaosScheduler is an operator built on top of the operator-sdk framework. It keeps on watching resources of kind ChaosSchedule and based on the scheduling parameters automates the formation of ChaosEngines, to be observed by ChaosOperator, instead of manually forming the ChaosEngine every time we wish to inject chaos in the cluster.

### How is ChaosScheduler different from ChaosOperator?

ChaosOperator operates on chaosengines while ChaosScheduler operates on chaosschedules which in turn forms chaosengines, through some scheduling techniques, to be observed by ChaosOperator. So ChaosOperator is a basic building block used to inject chaos in a cluster while ChaosScheduler is just a scheduling strategy that injects chaos in some form of pattern using ChaosOperator only. ChaosScheduler can not be used independently of ChaosOperator.

### What are the pre-requisites for ChaosScheduler?

For getting started with ChaosScheduler, we should just have ChaosOperator and all the litmus infrastructure components installed in the cluster beforehand.

### How to install ChaosScheduler?

Firstly install the rbac and crd -
```
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/chaos-scheduler/master/deploy/rbac.yaml
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/chaos-scheduler/master/deploy/crds/chaosschedule_crd.yaml
```

Install ChaosScheduler operator afterwards -
```
kubectl apply -f https://raw.githubusercontent.com/litmuschaos/chaos-scheduler/master/deploy/chaos-scheduler.yaml
```

### How to schedule the chaos using ChaosScheduler?

This depends on which type of schedule we want to use for injecting chaos. For basic understanding refer [constructing schedule](https://docs.litmuschaos.io/docs/scheduling/)

### What are the different techniques of scheduling the chaos?

As of now, there are 3 scheduling techniques which can be selected based on the parameter passed to spec.schedule.type
  
  - type=now
  - type=once
  - type=repeat

### What fields of spec.schedule are to be specified with spec.schedule.type=now?

No fields are needed to be specified for this as it launches the desired chaosengine immediately.

### What fields of spec.schedule are to be specified with spec.schedule.type=once?

We just need to pass spec.executionTime. Scheduler will launch the chaosengine exactly at the point of time mentioned in this parameter.

### What fields of spec.schedule are to be specified with spec.schedule.type=repeat?

All the fields of spec.schedule except spec.schedule.executionTime are needed to be specified.
 
  - startTime
  - endTime
  - minChaosInterval
  - includedHours
  - includedDays
  
It schedules chaosengines to be launched according to the parameters passed. It works just as a cronjob does, having superior functionalities such as we can control when the schedule will start and end.

### How to run ChaosScheduler in Namespaced mode?

Firstly install the crd -
```
kubectl apply -f https://github.com/litmuschaos/litmus/tree/master/mkdocs/docs/litmus-namespaced-scope/litmus-scheduler-namespaced-crd.yaml
```

Secondly install the rbac in the desired Namespace -
```
kubectl apply -f https://github.com/litmuschaos/litmus/tree/master/mkdocs/docs/litmus-namespaced-scope/litmus-scheduler-ns-rbac.yaml -n <namespace>
```

Install ChaosScheduler operator in the desired Namespace afterwards -
```
kubectl apply -f https://github.com/litmuschaos/litmus/tree/master/mkdocs/docs/litmus-namespaced-scope/litmus-namespaced-scheduler.yaml -n <namespace>
```

Execute ChaosScheduler with an experiment in the desired Namespace afterward.

` Note`: The ChaosServiceAccount used within the embedded ChaosEngine template needs to be chosen appropriately depending on the experiment scope. - 
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosSchedule
metadata:
  name: schedule-nginx
  namespace: <namespace>
spec:
  schedule:
    repeat:
      timeRange:
        startTime: "2020-05-12T05:47:00Z"   #should be modified according to current UTC Time, for type=repeat
        endTime: "2020-09-13T02:58:00Z"   #should be modified according to current UTC Time, for type=repeat
      properties:
        minChaosInterval: "2m"   #format should be like "10m" or "2h" accordingly for minutes and hours, for type=repeat
      workHours:
        includedHours: 0-12
      workDays:
        includedDays: "Mon,Tue,Wed,Sat,Sun" #should be set for type=repeat
  engineTemplateSpec:
    appinfo:
      appns: 'default'
      applabel: 'app=nginx'
      appkind: 'deployment'
    # It can be true/false
    annotationCheck: 'false'
    # It can be active/stop
    engineState: 'active'
    #ex. values: ns1:name=percona,ns2:run=nginx
    auxiliaryAppInfo: ''
    chaosServiceAccount: pod-delete-sa
    # It can be delete/retain
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


