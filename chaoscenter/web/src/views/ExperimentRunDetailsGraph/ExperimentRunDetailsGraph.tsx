import React from 'react';
import { Color } from '@harnessio/design-system';
import { Container } from '@harnessio/uicore';
import { withErrorBoundary } from 'react-error-boundary';
import { transformArgoData } from '@utils';
import type { ExecutionData } from '@api/entities';
import Loader from '@components/Loader';
import { BaseReactComponentProps, NodeType } from '@components/PipelineDiagram/types';
import ChaosExecutionNode from '@components/PipelineDiagram/Nodes/ChaosExecutionNode/ChaosExecutionNode';
import EndNodeStep from '@components/PipelineDiagram/Nodes/EndNode/EndNodeStep';
import StartNodeStep from '@components/PipelineDiagram/Nodes/StartNode/StartNodeStep';
import { DiagramFactory } from '@components/PipelineDiagram/DiagramFactory';
import { Event as DiagramEvent } from '@components/PipelineDiagram/Constants';
import { Fallback } from '@errors';
import css from './ExperimentRunDetailsGraph.module.scss';

interface ExperimentRunDetailsGraphProps {
  executionData: ExecutionData | undefined;
  selectedNodeID: string;
  handleCanvasClick: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleClickNode: (event: any) => void;
}

function ExperimentRunDetailsGraph({
  executionData,
  selectedNodeID,
  handleClickNode,
  handleCanvasClick
}: ExperimentRunDetailsGraphProps): React.ReactElement {
  const graphData = React.useMemo(() => transformArgoData(executionData?.nodes), [executionData?.nodes]);

  // Initiate DiagramFactory
  const diagram = new DiagramFactory('graph');
  diagram.registerNode('ChaosNode', ChaosExecutionNode as React.FC<BaseReactComponentProps>, true);
  diagram.registerNode(NodeType.EndNode, EndNodeStep);
  diagram.registerNode(NodeType.StartNode, StartNodeStep);
  const ChaosDiagram = diagram.render();

  const eventListeners = {
    [DiagramEvent.CanvasClick]: handleCanvasClick,
    [DiagramEvent.ClickNode]: handleClickNode
  };
  diagram.registerListeners(eventListeners);

  return (
    <Container height={'100%'} className={css.graphContainer} background={Color.GREY_50}>
      <Loader loading={!(graphData.length > 0)}>
        <ChaosDiagram data={graphData} readonly selectedNodeId={selectedNodeID} />
      </Loader>
    </Container>
  );
}
export default withErrorBoundary(ExperimentRunDetailsGraph, { FallbackComponent: Fallback });
