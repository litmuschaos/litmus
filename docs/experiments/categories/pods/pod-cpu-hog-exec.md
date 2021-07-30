## Pod CPU Hog Exec

It contains tunables to execute the `pod-cpu-hog-exec` experiment. This experiment stresses the cpu of the given pod for the specified `TOTAL_CHAOS_DURATION` duration. 

### CPU Cores

It stresses the `CPU_CORE` cpu cores of the targeted pod for the `TOTAL_CHAOS_DURATION` duration.

Use the following example to tune this:
<references to the sample manifest>

### Chaos Inject and Kill Commands

It defines the `CHAOS_INJECT_COMMAND` and `CHAOS_KILL_COMMAND` ENV to set the chaos inject and chaos kill commands respectively.
Default values of commands:
- `CHAOS_INJECT_COMMAND`: "md5sum /dev/zero"
- `CHAOS_KILL_COMMAND`: "kill $(find /proc -name exe -lname '*/md5sum' 2>&1 | grep -v 'Permission denied' | awk -F/ '{print $(NF-1)}')"

Use the following example to tune this:
<references to the sample manifest>