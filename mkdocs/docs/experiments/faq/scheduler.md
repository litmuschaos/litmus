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
    - instanceCount
    - includedDays
It schedules chaosengines to be launched according to the parameters passed. It works just as a cronjob does, having superior functionalities such as we can control when the schedule will start and end.
