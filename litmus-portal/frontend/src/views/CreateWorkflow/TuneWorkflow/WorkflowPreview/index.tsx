import React from 'react';
import { useTranslation } from 'react-i18next';
import { CustomYAML } from '../../../../models/redux/customyaml';

interface WorkflowPreviewProps {
  // nodes: Nodes;
  crd?: CustomYAML;
}

const WorkflowPreview: React.FC<WorkflowPreviewProps> = () => {
  const { t } = useTranslation(); // eslint-disable-line

  // Graph orientation
  const horizontal = false; // eslint-disable-line

  // console.log(crd);

  return <div />;

  // const classes = useStyles({ horizontal });

  // const [graphData, setGraphData] = useState<GraphData>({
  //   nodes: [],
  //   links: [],
  // });

  // useEffect(() => {
  //   const data: GraphData = {
  //     nodes: [],
  //     links: [],
  //   };

  //   for (const key of Object.keys(nodes)) {
  //     const node = nodes[key];

  //     data.nodes.push({
  //       id: key,
  //       class: `${node.phase} ${node.type}`,
  //       label:
  //         node.type !== 'StepGroup'
  //           ? createLabel({
  //               label: node.name,
  //               tooltip: node.name,
  //               phase: node.phase.toLowerCase(),
  //               horizontal,
  //             })
  //           : '',
  //       labelType: node.type !== 'StepGroup' ? 'svg' : 'string',
  //       config: { fullName: node.name },
  //     });

  //     if (node.children) {
  //       node.children.map((child) =>
  //         data.links.push({
  //           source: key,
  //           target: child,
  //           class: nodes[child].phase,
  //           config: {
  //             arrowhead:
  //               nodes[child].type === 'StepGroup' ? 'undirected' : 'vee',
  //           },
  //         })
  //       );
  //     }
  //   }

  //   setGraphData({
  //     nodes: [...data.nodes],
  //     links: [...data.links],
  //   });
  // }, [nodes, horizontal]);

  // return graphData.nodes.length ? (
  //   <>
  //     <DagreGraph
  //       className={classes.dagreGraph}
  //       nodes={graphData.nodes}
  //       links={graphData.links}
  //       config={{
  //         rankdir: horizontal ? 'LR' : 'TB',
  //         // align: 'UR',
  //         ranker: 'tight-tree',
  //       }}
  //       animate={1000}
  //       shape="rect"
  //       fitBoundaries
  //       zoomable
  //     />
  //   </>
  // ) : (
  //   <div>{t('workflowDetailsView.argoWorkFlow.loading')}</div>
  // );
};

export default WorkflowPreview;
