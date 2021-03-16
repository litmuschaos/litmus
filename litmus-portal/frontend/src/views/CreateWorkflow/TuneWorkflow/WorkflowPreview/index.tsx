import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DagreGraph, { d3Link, d3Node } from '../../../../components/DagreGraph';
import { Nodes } from '../../../../models/graphql/workflowListData';
import { createLabel } from './createLabel';
import useStyles from './styles';

interface GraphData {
  nodes: d3Node[];
  links: d3Link[];
}
interface ArgoWorkflowProps {
  nodes: Nodes;
}

const ArgoWorkflow: React.FC<ArgoWorkflowProps> = ({ nodes }) => {
  const { t } = useTranslation();

  // Graph orientation
  const horizontal = false;

  const classes = useStyles({ horizontal });

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
        label:
          node.type !== 'StepGroup'
            ? createLabel({
                label: node.name,
                tooltip: node.name,
                phase: node.phase.toLowerCase(),
                horizontal,
              })
            : '',
        labelType: node.type !== 'StepGroup' ? 'svg' : 'string',
        config: { fullName: node.name },
      });

      if (node.children) {
        node.children.map((child) =>
          data.links.push({
            source: key,
            target: child,
            class: nodes[child].phase,
            config: {
              arrowhead:
                nodes[child].type === 'StepGroup' ? 'undirected' : 'vee',
            },
          })
        );
      }
    }

    setGraphData({
      nodes: [...data.nodes],
      links: [...data.links],
    });
  }, [nodes, horizontal]);

  return graphData.nodes.length ? (
    <>
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
    </>
  ) : (
    <div>{t('workflowDetailsView.argoWorkFlow.loading')}</div>
  );
};

export default ArgoWorkflow;
