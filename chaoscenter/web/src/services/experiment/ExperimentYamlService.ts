import { merge } from 'lodash-es';
import {
  ChaosObjectStoreNameMap,
  ChaosIDB,
  ChaosObjectStoresPrimaryKeys,
  Experiment,
  ExperimentMetadata,
  ImageRegistry
} from '@db';
import type { ExperimentManifest, FaultData, FaultTunables, ProbeAttributes } from '@models';
import { ExecutionData, Weightages, Node, ExperimentType, ProbeObj } from '@api/entities';
import type { PipelineGraphState } from '@components/PipelineDiagram/types';

export interface PreProcessChaosExperiment<T> {
  manifest: T;
  experimentName: string;
  chaosInfrastructureID?: string;
  chaosInfrastructureNamespace?: string;
  imageRegistry?: ImageRegistry;
}

export interface StepNode extends Node {
  id: string;
}

export enum GetFaultTunablesOperation {
  InitialEnvs = 'InitialEnvs',
  UpdatedEnvs = 'UpdatedEnvs'
}

export abstract class ExperimentYamlService extends ChaosIDB {
  async getExperiment(key: ChaosObjectStoresPrimaryKeys['experiments']): Promise<Experiment | undefined> {
    try {
      return (await this.db).get(ChaosObjectStoreNameMap.EXPERIMENTS, key);
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  async deleteExperiment(key: ChaosObjectStoresPrimaryKeys['experiments']): Promise<void> {
    try {
      return (await this.db).delete(ChaosObjectStoreNameMap.EXPERIMENTS, key);
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  async updateExperimentDetails(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    experimentDetails: Partial<ExperimentMetadata>
  ): Promise<void> {
    try {
      const tx = (await this.db).transaction(ChaosObjectStoreNameMap.EXPERIMENTS, 'readwrite');
      const store = tx.objectStore(ChaosObjectStoreNameMap.EXPERIMENTS);
      const experiment = await store.get(key);

      if (experiment?.name !== experimentDetails.name) {
        if (experiment?.manifest) {
          experiment.manifest.metadata.name = experimentDetails.name;
        }
      }
      await store.put(merge(experiment, experimentDetails), key);
      await tx.done;
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  async updateExperimentManifest(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    updatedManifest: ExperimentManifest,
    isDirty?: boolean
  ): Promise<Experiment | undefined> {
    try {
      const tx = (await this.db).transaction(ChaosObjectStoreNameMap.EXPERIMENTS, 'readwrite');
      const store = tx.objectStore(ChaosObjectStoreNameMap.EXPERIMENTS);
      const experiment = await store.get(key);
      if (!experiment) return;

      if (isDirty !== undefined) experiment.unsavedChanges = isDirty;
      experiment.manifest = updatedManifest;
      if (updatedManifest.metadata.name) experiment.name = updatedManifest.metadata.name;

      await store.put(experiment, key);
      await tx.done;
      return experiment;
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  async clearExperimentManifest(key: ChaosObjectStoresPrimaryKeys['experiments']): Promise<void> {
    try {
      const tx = (await this.db).transaction(ChaosObjectStoreNameMap.EXPERIMENTS, 'readwrite');
      const store = tx.objectStore(ChaosObjectStoreNameMap.EXPERIMENTS);
      const experiment = await store.get(key);
      if (!experiment) return;

      experiment.manifest = undefined;

      await store.put(experiment, key);
      await tx.done;
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  getStepsFromExecutionData(executionData: ExecutionData | undefined): StepNode[] {
    // Early return if nodes have not been received from API yet
    if (!executionData?.nodes) return [];

    const nodes = executionData.nodes;
    const steps: StepNode[] = [];

    // Queue for level order traversal
    const queue: string[] = [];
    queue.push(Object.keys(nodes)[0]);

    while (queue.length !== 0) {
      // Type casting as string as it can't be undefined
      // because we are checking for that in while loop
      const nodeKey = queue.shift() as string;
      const node = nodes[nodeKey];

      // Add the node if it is not a type of Steps or StepGroup
      if (node.type !== 'StepGroup' && node.type !== 'Steps') {
        steps.push({ ...node, id: nodeKey });
      }

      // Add the children for next iteration until we exhaust the graph
      if (node.children !== null) node.children.map(child => queue.push(child));
    }

    return steps;
  }

  getExperimentScheduleType(manifest: ExperimentManifest | undefined): ExperimentType | undefined {
    if (!manifest) return;
    switch (manifest.kind) {
      case 'Workflow':
        return ExperimentType.NON_CRON;
      case 'CronWorkflow':
        return ExperimentType.CRON;
      default:
        return ExperimentType.NON_CRON;
    }
  }

  abstract doesExperimentHaveFaults(manifest: ExperimentManifest | undefined): boolean;

  abstract addFaultsToManifest(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    fault: FaultData,
    parallelNodeIdentifier: string,
    prevNodeIdentifier: string
  ): Promise<Experiment | undefined>;

  abstract removeFaultsFromManifest(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    faultName: string
  ): Promise<Experiment | undefined>;

  abstract extractChaosFaultsWithWeights(manifest: ExperimentManifest | undefined): Array<Weightages>;

  abstract getFaultsFromExperimentManifest(
    manifest: ExperimentManifest | undefined,
    isEditMode?: boolean
  ): PipelineGraphState[];

  abstract preProcessExperimentManifest(
    preProcessExperimentManifestDetails: PreProcessChaosExperiment<ExperimentManifest>
  ): ExperimentManifest;

  abstract extractResilienceProbeDetails(
    manifest: ExperimentManifest | undefined,
    faultName: string
  ): ProbeObj[] | undefined;

  abstract extractDeprecatedProbeDetails(
    manifest: ExperimentManifest | undefined,
    faultName: string
  ): ProbeAttributes[] | undefined;

  abstract updateFaultWeight(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    faultName: string,
    weight: number
  ): Promise<void>;

  abstract updateExperimentManifestWithFaultData(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    faultData: FaultData
  ): Promise<void>;

  abstract getFaultData(manifest: ExperimentManifest | undefined, faultName: string): FaultData | undefined;

  abstract getFaultTunables(
    faultData: FaultData | undefined,
    operation?: GetFaultTunablesOperation
  ): FaultTunables | undefined;

  abstract updateFaultTunablesInFaultData(
    faultData: FaultData | undefined,
    faultTunables: FaultTunables | undefined
  ): FaultData | undefined;

  abstract doesProbeNameExist(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    faultName: string | undefined,
    probeName: string | undefined
  ): Promise<boolean>;
}
