import React, { useEffect, useState } from 'react';
import { ExecutionData } from '../../../../models/workflowData';
import DagreGraph, { d3Link, d3Node } from '../../../DagreGraph';
import useStyles from './styles';

interface GraphData {
  nodes: d3Node[];
  links: d3Link[];
}

const ArgoWorkflow: React.FC<ExecutionData> = ({ nodes, phase }) => {
  const classes = useStyles();
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
  }, [phase]);

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
    />
  ) : (
    <div>Loading Graph...</div>
  );
};

export default ArgoWorkflow;
