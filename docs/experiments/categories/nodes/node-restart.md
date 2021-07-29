## Node Restart

It contains tunables to execute the `node-restart` experiment. This experiment restarts the given node for the specified `TOTAL_CHAOS_DURATION` duration.

### Reboot Command

It defines the command used to restart the targeted node. It can be tuned via `REBOOT_COMMAND` ENV.

Use the following example to tune this:
<references to the sample manifest>

### SSH User 

It defines the name of the SSH user for the targeted node. It can be tuned via `SSH_USER` ENV.

Use the following example to tune this:
<references to the sample manifest>

### Target Node Internal IP

It defines the internal IP of the targeted node. It is an optional field, if internal IP is not provided then it will derive the internal IP of the targeted node. It can be tuned via `TARGET_NODE_IP` ENV.

Use the following example to tune this:
<references to the sample manifest>
