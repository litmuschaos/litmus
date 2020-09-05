import React, { useEffect, useState } from 'react';
import { Nodes } from '../../../../models/workflowData';
import useActions from '../../../../redux/actions';
import * as NodeSelectionActions from '../../../../redux/actions/nodeSelection';
import DagreGraph, { d3Link, d3Node } from '../../../DagreGraph';
import useStyles from './styles';

interface GraphData {
  nodes: d3Node[];
  links: d3Link[];
}
interface ArgoWorkflowProps {
  nodes: Nodes;
}

const ArgoWorkflow: React.FC<ArgoWorkflowProps> = ({ nodes }) => {
  const classes = useStyles();
  // Redux action call for updating selected node
  const nodeSelection = useActions(NodeSelectionActions);

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    const data: GraphData = {
      nodes: [],
      links: [],
    };

    for (const key of Object.keys(nodes)) {
      const node = nodes[key];

      data.nodes.push({
        id: key,
        class: `${node.phase} ${node.type}`,
        label: node.type !== 'StepGroup' ? node.name : '',
        labelType: 'html',
      });

      if (node.children) {
        node.children.map((child) =>
          data.links.push({
            source: key,
            target: child,
            config: {
              arrowheadStyle: 'display: arrowhead',
            },
          })
        );
      }
    }

    setGraphData({
      nodes: [...data.nodes],
      links: [...data.links],
    });
  }, [nodes]);

  return graphData.nodes.length ? (
    <DagreGraph
      className={classes.dagreGraph}
      nodes={graphData.nodes}
      links={graphData.links}
      config={{
        ranker: 'tight-tree',
      }}
      animate={1000}
      shape="rect"
      fitBoundaries
      zoomable
      onNodeClick={({ original }) => {
        const nodeID = Object.keys(nodes).filter(
          (key) => key === original?.id
        )[0];
        nodeSelection.selectNode(nodes[nodeID]);
      }}
    />
  ) : (
    <div>Loading Graph...</div>
  );
};

export default ArgoWorkflow;
