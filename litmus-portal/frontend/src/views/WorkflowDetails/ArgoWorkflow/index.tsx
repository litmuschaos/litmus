import { Typography } from '@material-ui/core';
import AccountTreeRoundedIcon from '@material-ui/icons/AccountTreeRounded';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ButtonOutline from '../../../components/Button/ButtonOutline';
import DagreGraph, { d3Link, d3Node } from '../../../components/DagreGraph';
import { Nodes } from '../../../models/graphql/workflowData';
import useActions from '../../../redux/actions';
import * as NodeSelectionActions from '../../../redux/actions/nodeSelection';
import * as TabActions from '../../../redux/actions/tabs';
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
  const [horizontal, setHorizontal] = useState(false);

  const classes = useStyles({ horizontal });
  // Redux action call for updating selected node
  const nodeSelection = useActions(NodeSelectionActions);
  const tabs = useActions(TabActions);

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  // Get the selected Node
  const [selectedNodeID, setSelectedNodeID] = useState<string>(
    Object.keys(nodes)[0]
  );

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

  useEffect(() => {
    nodeSelection.selectNode({
      ...nodes[selectedNodeID],
      pod_name: selectedNodeID,
    });
  }, [selectedNodeID]);

  return graphData.nodes.length ? (
    <>
      <div className={classes.graphOptions}>
        <div>
          <ButtonOutline
            className={classes.layoutButton}
            handleClick={() => setHorizontal(!horizontal)}
          >
            <AccountTreeRoundedIcon />
          </ButtonOutline>
          <Typography component="span">Horizontal</Typography>
        </div>
        {/* <div>
          <ButtonOutline
            className={classes.layoutButton}
            handleClick={() => scrollGraph(true)}
          >
            <AddRoundedIcon />
          </ButtonOutline>
          <ButtonOutline
            className={classes.layoutButton}
            handleClick={() => scrollGraph(false)}
          >
            <RemoveRoundedIcon />
          </ButtonOutline>
        </div> */}
      </div>

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
        onNodeClick={({ original }) => {
          const nodeID = Object.keys(nodes).filter(
            (key) => key === original?.id
          )[0];
          setSelectedNodeID(nodeID);
          tabs.changeWorkflowDetailsTabs(1);
        }}
      />
    </>
  ) : (
    <div>{t('workflowDetailsView.argoWorkFlow.loading')}</div>
  );
};

export default ArgoWorkflow;
