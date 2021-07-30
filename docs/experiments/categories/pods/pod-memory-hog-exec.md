## Pod Memory Hog Exec

It contains tunables to execute the `pod-memory-hog-exec` experiment. This experiment stresses the memory of the given pod for the specified `TOTAL_CHAOS_DURATION` duration. 

### Memory Consumption

It stresses the `MEMORY_CONSUMPTION` MB memory of the targeted pod for the `TOTAL_CHAOS_DURATION` duration.
The memory consumption limit is 2000MB

Use the following example to tune this:
<references to the sample manifest>

### Chaos Kill Commands

It defines the `CHAOS_KILL_COMMAND` ENV to set the chaos kill command.
Default values of `CHAOS_KILL_COMMAND` command:
- `CHAOS_KILL_COMMAND`: "kill $(find /proc -name exe -lname '*/dd' 2>&1 | grep -v 'Permission denied' | awk -F/ '{print $(NF-1)}' | head -n 1)"

Use the following example to tune this:
<references to the sample manifest>