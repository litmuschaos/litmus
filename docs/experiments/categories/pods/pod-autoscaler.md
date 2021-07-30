## Pod Autoscaler

It contains tunables to execute the `pod-autoscaler` experiment. This experiment scales up/down the replicas of the targeted resources with matching namespace, labels, and kind provided at `spec.appinfo` in chaosengine for the specified `TOTAL_CHAOS_DURATION` duration.

### Replica counts

It defines the number of replicas, which should be present in the targeted application during the chaos. It can be tuned via `REPLICA_COUNT` ENV.

Use the following example to tune this:
<references to the sample manifest>