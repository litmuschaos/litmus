import React from 'react';
import { DiagramFactory } from '@components/PipelineDiagram/DiagramFactory';
import CreateNodeStep from '@components/PipelineDiagram/Nodes/CreateNode/CreateNodeStep';
import EndNodeStep from '@components/PipelineDiagram/Nodes/EndNode/EndNodeStep';
import StartNodeStep from '@components/PipelineDiagram/Nodes/StartNode/StartNodeStep';
import { BaseReactComponentProps, NodeType } from '@components/PipelineDiagram/types';
import type { ExperimentManifest } from '@models';
import ChaosExperimentNode from '@components/PipelineDiagram/Nodes/ChaosExperimentNode/ChaosExperimentNode';
import experimentYamlService from 'services/experiment';
import { InfrastructureType } from '@api/entities';
import css from './VisualizeExperimentManifest.module.scss';

interface VisualizeExperimentManifestViewProps {
  manifest: ExperimentManifest;
  initialZoomLevel?: number;
}

export default function VisualizeExperimentManifestView({
  manifest,
  initialZoomLevel
}: VisualizeExperimentManifestViewProps): React.ReactElement {
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(InfrastructureType.KUBERNETES);
  const experimentSteps = experimentHandler?.getFaultsFromExperimentManifest(manifest, false) ?? [];

  // Initiate DiagramFactory
  const diagram = new DiagramFactory('graph');

  // Register nodes
  diagram.registerNode('ChaosNode', ChaosExperimentNode as React.FC<BaseReactComponentProps>, true);
  diagram.registerNode(NodeType.EndNode, EndNodeStep);
  diagram.registerNode(NodeType.StartNode, StartNodeStep);
  diagram.registerNode(NodeType.CreateNode, CreateNodeStep as unknown as React.FC<BaseReactComponentProps>);

  const ChaosDiagram = diagram.render();

  return (
    <div className={css.graphContainer}>
      <ChaosDiagram data={experimentSteps} readonly={true} initialZoomLevel={initialZoomLevel} disableGraphActions />
    </div>
  );
}
