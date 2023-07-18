import { isEmpty } from 'lodash-es';
import type { IconName } from '@harnessio/icons';
import type { PipelineGraphState } from '@components/PipelineDiagram/types';
import type { Nodes } from '@api/entities';

// This function modifies the Argo nodes into Array<PipelineGraphState>
// ALGO: We do a level order traversal of the DAG graph (with constraints)
// and convert it into a 2D LinkedList like structure
export function transformArgoData(nodes: Nodes | undefined): Array<PipelineGraphState> {
  // Early return if nodes have not been received from API yet
  if (!nodes || isEmpty(nodes)) return [];

  const graphData: Array<PipelineGraphState> = [];
  // Queue for level order traversal
  let queue: string[] = [];
  queue.push(Object.keys(nodes)[0]);

  while (queue.length !== 0) {
    // Type casting as string as it can't be undefined
    // because we are checking for that in while loop
    const nodeKey = queue.shift() as string;
    const node = nodes[nodeKey];

    const childrenNodes: Array<PipelineGraphState> = [];

    // The siblings of the node gets converted to it's children
    if (queue.length > 0) {
      queue.forEach(childKey => {
        const childNode = nodes[childKey];
        return childrenNodes.push({
          id: childKey,
          name: childNode.name,
          type: 'ChaosNode',
          identifier: childKey,
          icon: mapNameToIcon(childNode.name),
          data: { name: childNode.name, chaosResult: childNode.chaosData?.chaosResult },
          status: childNode.phase
        });
      });

      // Empty the queue
      queue = [];
    }

    // Add the node if it is not a type of Steps or StepGroup
    if (node.type !== 'StepGroup' && node.type !== 'Steps') {
      graphData.push({
        id: nodeKey,
        name: node.name,
        type: 'ChaosNode',
        identifier: nodeKey,
        icon: mapNameToIcon(node.name),
        data: { name: node.name, chaosResult: node.chaosData?.chaosResult },
        status: node.phase,
        children: childrenNodes
      });
    }

    // Add the children for next iteration until we exhaust the graph
    if (node.children !== null) node.children.forEach(child => queue.push(child));
  }

  return graphData;
}

function mapNameToIcon(name: string): IconName {
  switch (name) {
    case 'install-chaos-faults':
      return 'import';
    case 'cleanup-chaos-resources':
      return 'command-rollback';
    default:
      return 'chaos-scenario-builder';
  }
}
