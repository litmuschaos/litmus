### Litmus Chaos Executor

- The executor runs the litmus jobs & monitors them. Typically invoked by the litmuschaos operator to run
  experiments listed in the chaosengine
- To learn more about the chaosengine & chaosexperiment resources, see [chaos operator](https://github.com/litmuschaos/chaos-operator)

## Limitations:

- It is unable to parse more than one configmap.
- The name of file which contains data for configmap in experimentCR should be parameters.yml
- The configmap is mount in the /mnt/ directory
