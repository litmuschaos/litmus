import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DagreGraph, { d3Link, d3Node } from '../../../../components/DagreGraph';
import { Steps } from '../../../../models/redux/customyaml';
import { RootState } from '../../../../redux/reducers';
import { extractSteps } from '../ExtractSteps';
import { createLabel } from './createLabel';
import useStyles from './styles';

interface GraphData {
  nodes: d3Node[];
  links: d3Link[];
}

interface ManifestSteps {
  name: string;
  template: string;
}

interface StepType {
  [key: string]: ManifestSteps[];
}

interface WorkflowPreviewProps {
  isCustomWorkflow: boolean;
  SequenceSteps?: StepType;
}

const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({
  isCustomWorkflow,
  SequenceSteps,
}) => {
  let steps: Steps[][] = [];
  const updatedSteps: Steps[][] = [];

  const manifest = useSelector(
    (state: RootState) => state.workflowManifest.manifest
  );

  // Graph orientation
  const horizontal = false;
  const isSequence = SequenceSteps !== undefined;
  const classes = useStyles({ horizontal, isSequence });

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  if (manifest !== '') {
    steps = extractSteps(isCustomWorkflow, manifest);
  }
  if (SequenceSteps !== undefined) {
    steps = Object.values(SequenceSteps);
  }

  useEffect(() => {
    const data: GraphData = {
      nodes: [],
      links: [],
    };

    if (steps) {
      /** Adding a Step Group after each node/index on the array
          
        Incoming Array : [
          0: [Node 1]
          1: [Node 2]      
        ]
        Outgoing Array: [
          0: [Node 1]
          1: [StepGroup]
          2: [Node 2]
          3: [StepGroup]
        ]
      */
      for (let i = 0; i < steps.length; i++) {
        if (steps[i].length !== 0) {
          updatedSteps.push(steps[i]);
          if (i !== steps.length - 1) {
            updatedSteps.push([
              {
                name: 'StepGroup',
                template: 'StepGroup',
              },
            ]);
          }
        }
      }

      let k = 0; // temporary variable to store absolute index
      for (let i = 0; i < updatedSteps.length; i++) {
        /**
         * Traversing the updated array with StepGroups and adding the
         * respective ids with the absolute index
         * From 1 to n
         */

        if (updatedSteps[i].length > 1) {
          for (let j = 0; j < updatedSteps[i].length; j++) {
            data.nodes.push({
              id: k.toString(),
              class: `${'pending'} ${'steps'}`,
              label: createLabel({
                label: updatedSteps[i][j].name,
                tooltip: updatedSteps[i][j].name,
                phase: 'pending',
                horizontal,
              }),
              labelType:
                updatedSteps[i][j].name !== 'StepGroup' ? 'svg' : 'string',
              config: { fullName: updatedSteps[i][j].name },
            });
            k++;
          }
        } else {
          data.nodes.push({
            id: k.toString(),
            class: `${'succeeded'} ${'steps'}`,
            label: createLabel({
              label: updatedSteps[i][0].name,
              tooltip: updatedSteps[i][0].name,
              phase: 'pending',
              horizontal,
            }),
            labelType:
              updatedSteps[i][0].name !== 'StepGroup' ? 'svg' : 'string',
            config: { fullName: updatedSteps[i][0].name },
          });
          k++;
        }
      }

      let nodeID = 0; // temporary variable to keep track of the node id
      for (let i = 0; i < updatedSteps.length - 1; i++) {
        /**
         * If the node at position i has a length equal to 1 and i+1 has
         * more children -> for cases where
         * the parent is a single node and the has two or more children
         *
         *      []  <- i (source)
         *       |
         *    []  []  <- i+1 (target)
         */

        if (updatedSteps[i].length === 1 && updatedSteps[i + 1].length > 1) {
          for (let j = 0; j < updatedSteps[i + 1].length; j++) {
            data.links.push({
              source: nodeID.toString(),
              target: (nodeID + j + 1).toString(),
              class: 'pending',
              config: {
                arrowhead:
                  updatedSteps[i][0].name !== 'StepGroup'
                    ? 'undirected'
                    : 'vee',
              },
            });
          }
        } else if (updatedSteps[i].length > 1) {
          /**
           * If the current node's index is the child's then connect all the children
           * to the next StepGroup.
           *
           *     []  []  []  <- i (source)
           *       |   |
           *         []      <- i+1 (target, StepGroup)
           */
          for (let j = 0; j < updatedSteps[i].length; j++) {
            data.links.push({
              source: (nodeID + j + 1).toString(),
              target: (nodeID + updatedSteps[i].length + 1).toString(),
              class: 'pending',
              config: {
                arrowhead:
                  updatedSteps[i][0].name !== 'StepGroup'
                    ? 'undirected'
                    : 'vee',
              },
            });
          }
          nodeID = nodeID + updatedSteps[i].length + 1;
        } else {
          /**
           * Else connect the parent node to the child node in a one-to-one mapping.
           *
           *       []   <- i (source)
           *       |
           *       []   <- i+i (target)
           */
          data.links.push({
            source: nodeID.toString(),
            target: (nodeID + 1).toString(),
            class: 'pending',
            config: {
              arrowhead:
                updatedSteps[i][0].name !== 'StepGroup' ? 'undirected' : 'vee',
            },
          });
          nodeID++;
        }
      }
    }

    setGraphData({
      nodes: [...data.nodes],
      links: [...data.links],
    });
  }, [manifest, SequenceSteps]);

  return graphData.nodes.length ? (
    <DagreGraph
      className={classes.dagreGraph}
      nodes={graphData.nodes}
      links={graphData.links}
      config={{
        rankdir: horizontal ? 'LR' : 'TB',
        // align: 'UR',
        ranker: 'tight-tree',
      }}
      animate={1000}
      shape="rect"
      fitBoundaries
      zoomable
    />
  ) : (
    <div className={classes.load}>Visualizing your Workflow</div>
  );
};

export default WorkflowPreview;
