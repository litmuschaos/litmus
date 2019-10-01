### Litmus Chaos Executor

- The executor runs the litmus jobs & monitors them. Typically invoked by the litmuschaos operator to run
  experiments listed in the chaosengine
- To learn more about the chaosengine & chaosexperiment resources, see [chaos operator](https://github.com/litmuschaos/chaos-operator)
- To override the ENV_VARIABLES in the chaos epxeriments, make changes in the chaos-experiments yaml, or make add those additional variables, or the variables to override the static variables in the experiements. Add those variables in the component area of each experiments, and then apply those changes using kubectl apply.