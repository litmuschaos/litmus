---
hide:
  - toc
---
# Chaos Scheduler

## Table of Contents

1. [Scheduler not creating chaosengines for type=repeat?](#scheduler-not-creating-chaosengines-for-typerepeat)

### Scheduler not creating chaosengines for type=repeat?

If the ChaosSchedule has been created successfully created in the cluster and ChaosEngine is not being formed, the most common problem is that either start or 
end time has been wrongly specified. We should verify the times. We can identify if this is the problem or not by changing to `type=now`. If the ChaosEngine is 
formed successfully then the problem is with the specified time ranges, if ChaosEngine is still not formed, then the problem is with `engineSpec`. 

