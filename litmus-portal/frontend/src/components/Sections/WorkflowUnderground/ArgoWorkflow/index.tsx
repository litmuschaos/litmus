import React, { useEffect, useState } from 'react';
import { ExecutionData } from '../../../../models/workflowData';
import DagreGraph, { d3Link, d3Node } from '../../../DagreGraph';

interface GraphData {
  nodes: d3Node[];
  links: d3Link[];
}

const ArgoWorkflow: React.FC<ExecutionData> = ({ nodes, phase }) => {
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
        class: node.phase,
        label: node.name,
        labelType: 'html',
      });

      if (node.children) {
        node.children.map((child) =>
          data.links.push({
            source: key,
            target: child,
            class: 'edge',
            label: 'edge',
            config: {
              arrowheadStyle: 'display: arrowhead',
              style: 'fill:#000',
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
      nodes={graphData.nodes}
      links={graphData.links}
      config={{
        rankdir: 'TB',
        align: 'UL',
        ranker: 'tight-tree',
      }}
      width="700"
      height="500"
      animate={1000}
      shape="circle"
      fitBoundaries
      zoomable
    />
  ) : (
    <div>Loading Graph...</div>
  );
};

export default ArgoWorkflow;
