## Cassandra pod delete

It deletes the Cassandra pods with matching namespace, labels, and kind provided at `spec.appinfo` in chaosengine for the `TOTAL_CHAOS_DURATION` duration. 

### Cassandra App Details

It tunes the cassandra service name at `CASSANDRA_SVC_NAME` and cassandra port at `CASSANDRA_PORT`. 

Use the following example to tune this:
<references to the sample manifest>

### Force Delete

The cassandra pod can be deleted `forcefully` or `gracefully`. It can be tuned with the `FORCE` env. It will delete the pod forcefully if `FORCE` is provided as `true` and it will delete the pod gracefully if `FORCE` is provided as `false`.

Use the following example to tune this:
<references to the sample manifest>

### Liveness check of cassandra

- The cassandra liveness can be tuned with `CASSANDRA_LIVENESS_CHECK` env. Provide `CASSANDRA_LIVENESS_CHECK` as `enabled` to enable the liveness check and provide `CASSANDRA_LIVENESS_CHECK` as `disabled` to skip the liveness check. The default value is disabled.
- The cassandra liveness image can be provided at `CASSANDRA_LIVENESS_IMAGE`.
- The cassandra liveness pod performs the CRUD operations to verify the liveness of cassandra. It creates the keyspace with `KEYSPACE_REPLICATION_FACTOR` keyspace factor.

Use the following example to tune this:
<references to the sample manifest>

### Multiple Iterations Of Chaos

The multiple iterations of chaos can be tuned via setting `CHAOS_INTERVAL` ENV. Which defines the delay between each iteration of chaos.

Use the following example to tune this:
<references to the sample manifest>
