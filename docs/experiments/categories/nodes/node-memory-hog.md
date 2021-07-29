## Node Memory Hog

It contains tunables to execute the `node-memory-hog` experiment. This experiment stresses the memory of the given node for the specified `TOTAL_CHAOS_DURATION` duration.

### Memory Consumption Percentage

It stresses the `MEMORY_CONSUMPTION_PERCENTAGE` percentage of total node capacity of the targeted node. 

Use the following example to tune this:
<references to the sample manifest>

### Memory Consumption Mebibytes

It stresses the `MEMORY_CONSUMPTION_MEBIBYTES` MiBi of the memory of the targeted node. 
It is mutually exclusive with the `MEMORY_CONSUMPTION_PERCENTAGE` ENV. If `MEMORY_CONSUMPTION_PERCENTAGE` ENV is set then it will use the percentage for the stress otherwise, it will stress the i/o based on `MEMORY_CONSUMPTION_MEBIBYTES` ENV.

Use the following example to tune this:
<references to the sample manifest>

### Workers For Stress

The workers count for the stress can be tuned with `NUMBER_OF_WORKERS` ENV.

Use the following example to tune this:
<references to the sample manifest>