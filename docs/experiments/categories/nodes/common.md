## Common Tunables For Node Experiments

It contains tunables, which are common for all the node experiments. These tunables can be provided at `.spec.experiment[*].spec.components.env` in chaosengine.

### Target Single Node

It defines the name of the target node subjected to chaos. The target node can be tuned via `TARGET_NODE` ENV. It contains only a single node name.
`NOTE`: It is supported by [node-drain, node-taint, node-restart, kubelet-service-kill, docker-service-kill] experiments. 

Use the following example to tune this:
<references to the sample manifest>

### Target Multiple Nodes

It defines the comma-separated name of the target nodes subjected to chaos. The target nodes can be tuned via `TARGET_NODES` ENV.
`NOTE`: It is supported by [node-cpu-hog, node-memory-hog, node-io-stress] experiments

Use the following example to tune this:
<references to the sample manifest>

### Target Nodes With Labels

It defines the labels of the targeted node(s) subjected to chaos. The node labels can be tuned via `NODE_LABEL` ENV. 
It is mutually exclusive with the `TARGET_NODE(S)` ENV. If `TARGET_NODE(S)` ENV is set then it will use the nodes provided inside it otherwise, it will derive the node name(s) with matching node labels.

Use the following example to tune this:
<references to the sample manifest>

### Node Affected Percentage

It defines the percentage of nodes subjected to chaos with matching node labels. It can be tuned with `NODES_AFFECTED_PERC` ENV. If `NODES_AFFECTED_PERC` is provided as `empty` or `0` then it will target a minimum of one node.
It is supported by [node-cpu-hog, node-memory-hog, node-io-stress] experiments. The rest of the experiment selects only a single node for the chaos.

Use the following example to tune this:
<references to the sample manifest>
