import { parse } from 'yaml';
import { ChaosObjectStoreNameMap, ChaosObjectStoresPrimaryKeys, Experiment } from '@db';
import {
  ChaosEngine,
  ChaosExperiment,
  CronWorkflow,
  FaultData,
  FaultTunableInputType,
  FaultTunables,
  KubernetesExperimentManifest,
  ProbeAttributes,
  Template,
  Workflow,
  WorkflowSpec,
  WorkflowStep,
  WorkflowToleration
} from '@models';
import { yamlStringify } from '@utils';
import { Weightages, InfrastructureType, ProbeObj } from '@api/entities';
import type { PipelineGraphState } from '@components/PipelineDiagram/types';
import { EnvVar } from 'models/k8s';
import ExperimentFactory from './ExperimentFactory';
import { ExperimentYamlService, GetFaultTunablesOperation, PreProcessChaosExperiment } from './ExperimentYamlService';

export class KubernetesYamlService extends ExperimentYamlService {
  async addFaultsToManifest(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    { faultName, faultCR, engineCR, weight }: FaultData,
    parallelNodeIdentifier: string,
    prevNodeIdentifier: string
  ): Promise<Experiment | undefined> {
    try {
      const tx = (await this.db).transaction(ChaosObjectStoreNameMap.EXPERIMENTS, 'readwrite');
      const store = tx.objectStore(ChaosObjectStoreNameMap.EXPERIMENTS);
      const experiment = await store.get(key);
      if (!experiment) return;

      experiment.unsavedChanges = true;
      const [templates, steps] = this.getTemplatesAndSteps(experiment?.manifest as KubernetesExperimentManifest);

      // Add to steps in entry template
      if (parallelNodeIdentifier !== '') {
        steps?.map(step => {
          const isSiblingStep = step.some(s => s.template === parallelNodeIdentifier);
          if (isSiblingStep) {
            step.push({ name: faultName, template: faultName });
          }
        });
      } else {
        if (prevNodeIdentifier !== '') {
          let index = 0;
          steps?.map((step, i) =>
            step.map(s => {
              if (s.template === prevNodeIdentifier) index = i;
            })
          );
          steps?.splice(index + 1, 0, [{ name: faultName, template: faultName }]);
        } else {
          steps?.splice(-1, 0, [{ name: faultName, template: faultName }]);
        }
      }

      // Get install-chaos-faults template artifacts
      const installTemplateArtifacts = templates?.filter(template => template.name === 'install-chaos-faults')[0].inputs
        ?.artifacts;

      // Add faults in install-chaos-faults template
      installTemplateArtifacts?.push({
        name: faultName,
        path: `/tmp/${faultName}.yaml`,
        raw: {
          data: yamlStringify(faultCR)
        }
      });

      const [updatedChaosEngine] = this.postProcessChaosEngineManifest(engineCR, faultName);

      // Add engine to the templates
      templates?.push({
        name: faultName,
        inputs: {
          artifacts: [
            {
              name: faultName,
              path: `/tmp/chaosengine-${faultName}.yaml`,
              raw: {
                data: yamlStringify(updatedChaosEngine)
              }
            }
          ]
        },
        metadata: {
          labels: {
            weight: weight !== undefined ? weight.toString() : '10'
          }
        },
        container: {
          name: '',
          image: `docker.io/litmuschaos/litmus-checker:2.11.0`,
          args: [`-file=/tmp/chaosengine-${faultName}.yaml`, '-saveName=/tmp/engine-name']
        }
      });

      // Add instanceID in revert step
      const revertContainer = templates?.filter(template => template.name === 'cleanup-chaos-resources')[0]?.container;

      if (revertContainer?.args) {
        revertContainer.args[0] =
          'kubectl delete chaosengine -l workflow_run_id={{workflow.uid}} -n {{workflow.parameters.adminModeNamespace}}';
      }

      await store.put({ ...experiment }, key);
      await tx.done;

      return experiment;
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  async removeFaultsFromManifest(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    faultName: string
  ): Promise<Experiment | undefined> {
    try {
      const tx = (await this.db).transaction(ChaosObjectStoreNameMap.EXPERIMENTS, 'readwrite');
      const store = tx.objectStore(ChaosObjectStoreNameMap.EXPERIMENTS);
      const experiment = await store.get(key);
      if (!experiment) return;

      experiment.unsavedChanges = true;
      const [templates, steps] = this.getTemplatesAndSteps(experiment?.manifest as KubernetesExperimentManifest);

      // Remove faults from steps in entry template
      let index = 0;
      steps?.map((step, i) =>
        step.map(s => {
          if (s.template === faultName) index = i;
        })
      );

      if (steps?.[index].length === 1) {
        steps?.splice(index, 1);
      } else {
        steps?.splice(
          index,
          1,
          steps[index].filter(s => s.template !== faultName)
        );
      }

      // Get install-chaos-faults template artifacts
      const installTemplateArtifacts = templates?.filter(template => template.name === 'install-chaos-faults')[0].inputs
        ?.artifacts;

      // Remove faults from install-chaos-faults template
      installTemplateArtifacts?.map((artifact, i) => {
        if (artifact.name === faultName) index = i;
      });
      installTemplateArtifacts?.splice(index, 1);

      // Remove engine from the templates
      templates?.map((template, i) => {
        if (template.name === faultName) index = i;
      });
      templates?.splice(index, 1);

      await store.put({ ...experiment }, key);
      await tx.done;

      return experiment;
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  async updateExperimentManifestWithFaultData(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    { faultName, faultCR, engineCR, probes }: FaultData
  ): Promise<void> {
    try {
      const tx = (await this.db).transaction(ChaosObjectStoreNameMap.EXPERIMENTS, 'readwrite');
      const store = tx.objectStore(ChaosObjectStoreNameMap.EXPERIMENTS);
      const experiment = await store.get(key);
      if (!experiment) return;

      experiment.unsavedChanges = true;
      const [templates] = this.getTemplatesAndSteps(experiment?.manifest as KubernetesExperimentManifest);
      // Remove engine from the templates
      let index = 0;
      let expWeight = '10';
      templates?.map((template, i) => {
        if (template.name === 'install-chaos-faults') {
          template.inputs?.artifacts?.map(artifact => {
            if (artifact.name === faultName) {
              artifact.raw = {
                data: yamlStringify(faultCR)
              };
            }
          });
        }
        if (template.name === faultName) {
          index = i;
          expWeight = template.metadata?.labels?.weight ?? '10';
        }
      });

      if (engineCR?.metadata?.annotations) {
        engineCR.metadata.annotations.probeRef = JSON.stringify(probes);
      }

      // Add engine to the templates
      templates?.splice(index, 1, {
        name: faultName,
        inputs: {
          artifacts: [
            {
              name: faultName,
              path: `/tmp/chaosengine-${faultName}.yaml`,
              raw: {
                data: yamlStringify(engineCR)
              }
            }
          ]
        },
        metadata: {
          labels: {
            weight: expWeight
          }
        },
        container: {
          name: '',
          image: `docker.io/litmuschaos/litmus-checker:2.11.0`,
          args: [`-file=/tmp/chaosengine-${faultName}.yaml`, '-saveName=/tmp/engine-name']
        }
      });

      await store.put({ ...experiment }, key);
      await tx.done;
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  async updateFaultWeight(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    faultName: string,
    weight: number
  ): Promise<void> {
    try {
      const tx = (await this.db).transaction(ChaosObjectStoreNameMap.EXPERIMENTS, 'readwrite');
      const store = tx.objectStore(ChaosObjectStoreNameMap.EXPERIMENTS);
      const experiment = await store.get(key);
      if (!experiment) return;

      experiment.unsavedChanges = true;
      const [templates] = this.getTemplatesAndSteps(experiment?.manifest as KubernetesExperimentManifest);

      templates?.map(template => {
        if (template.name === faultName) {
          if (template.metadata) {
            template.metadata.labels = {
              ...template.metadata?.labels,
              weight: weight.toString()
            };
          }
        }
      });

      await store.put({ ...experiment }, key);
      await tx.done;
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  async updateNodeSelector(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    nodeSelector: {
      key: string;
      value: string;
    },
    remove: boolean
  ): Promise<void> {
    try {
      const tx = (await this.db).transaction(ChaosObjectStoreNameMap.EXPERIMENTS, 'readwrite');
      const store = tx.objectStore(ChaosObjectStoreNameMap.EXPERIMENTS);
      const experiment = await store.get(key);
      if (!experiment) return;

      experiment.unsavedChanges = true;
      const [, , spec] = this.getTemplatesAndSteps(experiment?.manifest as KubernetesExperimentManifest);

      if (spec && !remove) {
        spec.nodeSelector = { [nodeSelector.key]: nodeSelector.value };
      } else {
        delete spec?.nodeSelector;
      }

      const [templates] = this.getTemplatesAndSteps(experiment?.manifest as KubernetesExperimentManifest);

      templates?.map(template => {
        if (template.inputs?.artifacts?.[0]?.raw?.data) {
          const chaosEngineCR = parse(template.inputs.artifacts[0].raw.data ?? '') as ChaosEngine;
          if (chaosEngineCR.kind === 'ChaosEngine') {
            const updatedEngineCR = this.updateNodeSelectorInChaosEngine(chaosEngineCR, nodeSelector, remove);
            template.inputs.artifacts[0].raw.data = yamlStringify(updatedEngineCR);
          }
        }
      });

      await store.put({ ...experiment }, key);
      await tx.done;
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  private updateNodeSelectorInChaosEngine(
    manifest: ChaosEngine | undefined,
    nodeSelector: {
      key: string;
      value: string;
    },
    remove: boolean
  ): ChaosEngine | undefined {
    if (!manifest?.spec) return;

    if (remove) {
      if (manifest.spec?.components?.runner?.nodeSelector) {
        delete manifest.spec?.components?.runner?.nodeSelector;
      }
      if (manifest.spec?.experiments[0].spec.components?.nodeSelector) {
        delete manifest.spec.experiments[0].spec.components?.nodeSelector;
      }
      return manifest;
    }

    manifest.spec.components = {
      ...manifest.spec.components,
      runner: {
        ...manifest.spec.components?.runner,
        nodeSelector: { [nodeSelector.key]: nodeSelector.value }
      }
    };
    manifest.spec.experiments[0].spec.components = {
      ...manifest.spec.experiments[0].spec.components,
      nodeSelector: { [nodeSelector.key]: nodeSelector.value }
    };

    return manifest;
  }

  async updateToleration(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    toleration: WorkflowToleration,
    remove: boolean
  ): Promise<void> {
    try {
      const tx = (await this.db).transaction(ChaosObjectStoreNameMap.EXPERIMENTS, 'readwrite');
      const store = tx.objectStore(ChaosObjectStoreNameMap.EXPERIMENTS);
      const experiment = await store.get(key);
      if (!experiment) return;

      experiment.unsavedChanges = true;
      const [, , spec] = this.getTemplatesAndSteps(experiment?.manifest as KubernetesExperimentManifest);

      if (spec && !remove) {
        spec.tolerations = [
          {
            effect: toleration.effect ? toleration.effect : 'NoExecute',
            key: toleration.key ?? '',
            operator: toleration.operator ? toleration.operator : 'Equal',
            value: toleration.value ?? ''
          }
        ];
      } else {
        delete spec?.tolerations;
      }

      await store.put({ ...experiment }, key);
      await tx.done;
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  async convertToNonCronExperiment(key: ChaosObjectStoresPrimaryKeys['experiments']): Promise<void> {
    try {
      const tx = (await this.db).transaction(ChaosObjectStoreNameMap.EXPERIMENTS, 'readwrite');
      const store = tx.objectStore(ChaosObjectStoreNameMap.EXPERIMENTS);
      const experiment = await store.get(key);
      if (!experiment) return;

      experiment.unsavedChanges = true;
      const manifest = experiment?.manifest as CronWorkflow;
      if (!manifest || manifest.kind === 'Workflow') return;

      const nonCronManifest: Workflow = {
        kind: 'Workflow',
        apiVersion: manifest.apiVersion,
        metadata: manifest.metadata,
        spec: manifest.spec.workflowSpec
      };

      await store.put({ ...experiment, manifest: nonCronManifest }, key);
      await tx.done;
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  async convertToCronExperiment(key: ChaosObjectStoresPrimaryKeys['experiments'], schedule: string): Promise<void> {
    try {
      const tx = (await this.db).transaction(ChaosObjectStoreNameMap.EXPERIMENTS, 'readwrite');
      const store = tx.objectStore(ChaosObjectStoreNameMap.EXPERIMENTS);
      const experiment = await store.get(key);
      if (!experiment) return;

      experiment.unsavedChanges = true;
      const manifest = experiment?.manifest as Workflow;
      if (!manifest || manifest.kind === 'CronWorkflow') return;

      const cronManifest: CronWorkflow = {
        kind: 'CronWorkflow',
        apiVersion: manifest.apiVersion,
        metadata: manifest.metadata,
        spec: {
          schedule,
          concurrencyPolicy: 'Forbid',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          workflowSpec: manifest.spec
        }
      };

      await store.put({ ...experiment, manifest: cronManifest }, key);
      await tx.done;
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  async updateCronExpression(key: ChaosObjectStoresPrimaryKeys['experiments'], schedule: string): Promise<void> {
    try {
      const tx = (await this.db).transaction(ChaosObjectStoreNameMap.EXPERIMENTS, 'readwrite');
      const store = tx.objectStore(ChaosObjectStoreNameMap.EXPERIMENTS);
      const experiment = await store.get(key);
      if (!experiment) return;

      experiment.unsavedChanges = true;
      const manifest = experiment?.manifest as CronWorkflow;
      if (!manifest || manifest.kind === 'Workflow') return;

      manifest.spec.schedule = schedule;

      await store.put({ ...experiment }, key);
      await tx.done;
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  getTemplatesAndSteps(
    manifest: KubernetesExperimentManifest | undefined
  ): [Template[] | undefined, WorkflowStep[][] | undefined, WorkflowSpec | undefined] {
    let templates: Template[] | undefined;
    let steps: WorkflowStep[][] | undefined;
    let spec: WorkflowSpec | undefined;

    if (!manifest) return [templates, steps, spec];

    if (manifest.kind === 'Workflow') {
      spec = (manifest as Workflow).spec;
      const entryPoint = spec.entrypoint;
      templates = spec.templates;
      steps = templates?.filter(template => template.name === entryPoint)[0].steps;
    } else if (manifest.kind === 'CronWorkflow') {
      spec = (manifest as CronWorkflow).spec.workflowSpec;
      const entryPoint = spec.entrypoint;
      templates = spec.templates;
      steps = templates?.filter(template => template.name === entryPoint)[0].steps;
    }

    return [templates, steps, spec];
  }

  preProcessExperimentManifest({
    manifest,
    experimentName,
    chaosInfrastructureNamespace,
    imageRegistry
  }: PreProcessChaosExperiment<KubernetesExperimentManifest>): KubernetesExperimentManifest {
    const [, , spec] = this.getTemplatesAndSteps(manifest);
    if (manifest.metadata) {
      manifest.metadata.name = experimentName;
      manifest.metadata.namespace = chaosInfrastructureNamespace ?? 'litmus';
    }

    if (spec?.arguments?.parameters) {
      spec.arguments.parameters.forEach(parameter => {
        if (parameter.name === 'adminModeNamespace') {
          parameter.value = chaosInfrastructureNamespace ?? 'litmus';
        }
      });
    }

    if (spec && imageRegistry?.secret) {
      if (spec.imagePullSecrets) {
        spec.imagePullSecrets.push({ name: imageRegistry.secret });
      } else {
        spec.imagePullSecrets = [{ name: imageRegistry.secret }];
      }
    }

    return manifest;
  }

  postProcessExperimentManifest(
    manifest: KubernetesExperimentManifest | undefined
  ): KubernetesExperimentManifest | undefined {
    const [templates] = this.getTemplatesAndSteps(manifest);

    templates?.map(template => {
      if (template.inputs?.artifacts?.[0].raw?.data) {
        const chaosEngineCR = parse(template.inputs.artifacts[0].raw.data ?? '') as ChaosEngine;
        if (chaosEngineCR.kind === 'ChaosEngine') {
          const [updatedEngineCR] = this.postProcessChaosEngineManifest(
            chaosEngineCR,
            template.inputs.artifacts[0].name,
            manifest?.metadata.name
          );
          template.inputs.artifacts[0].raw.data = yamlStringify(updatedEngineCR);
        }
      }
    });

    // Add instanceID in revert step
    const revertContainer = templates?.filter(template => template.name === 'cleanup-chaos-resources')[0]?.container;

    if (revertContainer?.args) {
      revertContainer.args[0] =
        'kubectl delete chaosengine -l workflow_run_id={{workflow.uid}} -n {{workflow.parameters.adminModeNamespace}}';
    }

    return manifest;
  }

  private postProcessChaosEngineManifest(
    manifest: ChaosEngine | undefined,
    engineName: string,
    experimentName?: string
  ): [ChaosEngine | undefined] {
    if (!manifest) return [manifest];

    if (manifest.metadata) {
      manifest.metadata.namespace = '{{workflow.parameters.adminModeNamespace}}';
      //Add generate name and delete name key
      manifest.metadata.generateName = engineName;
      delete manifest.metadata.name;

      manifest.metadata.labels = {
        ...manifest.metadata.labels,
        workflow_run_id: '{{ workflow.uid }}'
      };
      if (experimentName) {
        manifest.metadata.labels = {
          ...manifest.metadata.labels,
          workflow_name: experimentName,
          workflow_run_id: '{{ workflow.uid }}'
        };
      }
    }
    return [manifest];
  }

  checkProbesInExperimentManifest(manifest: KubernetesExperimentManifest | undefined): string | undefined {
    const [templates] = this.getTemplatesAndSteps(manifest);
    let name = undefined;

    templates?.map(template => {
      if (template.inputs?.artifacts?.[0].raw?.data) {
        const chaosEngineCR = parse(template.inputs.artifacts[0].raw.data ?? '') as ChaosEngine;
        if (chaosEngineCR.kind === 'ChaosEngine') {
          if (chaosEngineCR.metadata?.annotations === undefined) {
            name = template.inputs.artifacts[0].name;
          } else if (
            chaosEngineCR.metadata?.annotations &&
            chaosEngineCR.metadata?.annotations.probeRef === undefined
          ) {
            name = template.inputs.artifacts[0].name;
          }
        }
      }
    });

    return name;
  }

  doesProbeMetadataExists(manifest: KubernetesExperimentManifest | undefined): boolean {
    const [templates] = this.getTemplatesAndSteps(manifest);
    let doesProbeExists = false;

    templates?.map(template => {
      if (template.inputs?.artifacts?.[0].raw?.data) {
        const chaosEngineCR = parse(template.inputs.artifacts[0].raw.data ?? '') as ChaosEngine;
        if (chaosEngineCR.kind === 'ChaosEngine') {
          if (chaosEngineCR.spec?.experiments[0].spec.probe !== undefined) {
            doesProbeExists = true;
          }
        }
      }
    });

    return doesProbeExists;
  }

  _probesInExperimentManifest(manifest: KubernetesExperimentManifest | undefined): string[] | undefined {
    const [templates] = this.getTemplatesAndSteps(manifest);
    const probes: string[] = [];

    templates?.map(template => {
      if (template.inputs?.artifacts?.[0].raw?.data) {
        const chaosEngineCR = parse(template.inputs.artifacts[0].raw.data ?? '') as ChaosEngine;
        if (chaosEngineCR.kind === 'ChaosEngine') {
          JSON.parse(chaosEngineCR.metadata!.annotations!.probeRef).map((probeObj: ProbeObj) =>
            probes.push(probeObj.name)
          );
        }
      }
    });

    return probes;
  }

  extractChaosFaultsWithWeights(manifest: KubernetesExperimentManifest | undefined): Weightages[] {
    const allFaults: Weightages[] = [];

    const [templates] = this.getTemplatesAndSteps(manifest);
    templates?.forEach(template => {
      if (template.inputs && template.inputs.artifacts) {
        template.inputs.artifacts.forEach(artifact => {
          const chaosEngine = parse(artifact.raw?.data ?? '');
          // Condition to check for the kind as ChaosEngine
          if (chaosEngine.kind === 'ChaosEngine') {
            allFaults.push({
              experimentName: template.name,
              weightage: template.metadata?.labels?.weight ? parseInt(template.metadata.labels.weight) : 10
            });
          }
        });
      }
    });

    return allFaults;
  }

  doesExperimentHaveFaults(manifest: KubernetesExperimentManifest | undefined): boolean {
    const [templates] = this.getTemplatesAndSteps(manifest);

    // Get install-chaos-faults template artifacts
    const installTemplateArtifacts = templates?.filter(template => template.name === 'install-chaos-faults')[0].inputs
      ?.artifacts;

    // Check if experiment has faults
    return installTemplateArtifacts ? installTemplateArtifacts.length > 0 : false;
  }

  getFaultsFromExperimentManifest(
    manifest: KubernetesExperimentManifest | undefined,
    isEditMode?: boolean
  ): PipelineGraphState[] {
    const graphData: Array<PipelineGraphState> = [];

    if (!manifest) return graphData;

    const [, steps] = this.getTemplatesAndSteps(manifest);

    steps?.map(step => {
      if (step.length === 0) return;

      if (isEditMode && (step[0].template === 'install-chaos-faults' || step[0].template === 'cleanup-chaos-resources'))
        return;

      graphData.push({
        id: step[0]?.template ?? '',
        name: step[0]?.name ?? '',
        type: 'ChaosNode',
        identifier: step[0]?.template ?? '',
        data: {},
        children: step.slice(1).map(subStep => ({
          id: subStep.template ?? '',
          name: subStep.name ?? '',
          type: 'ChaosNode',
          identifier: subStep.template ?? '',
          data: {}
        }))
      });
    });

    return graphData;
  }

  extractDeprecatedProbeDetails(
    manifest: KubernetesExperimentManifest | undefined,
    faultName: string
  ): ProbeAttributes[] | undefined {
    const [templates] = this.getTemplatesAndSteps(manifest);

    let probes: ProbeAttributes[] | undefined;

    templates?.map(template => {
      if (template.name === faultName) {
        if (!template.inputs?.artifacts?.[0].raw?.data) return;

        const chaosEngine = parse(template.inputs.artifacts[0].raw.data) as ChaosEngine;
        probes = chaosEngine.spec?.experiments?.[0].spec.probe;
      }
    });

    return probes;
  }

  getFaultData(manifest: KubernetesExperimentManifest | undefined, faultName: string): FaultData | undefined {
    if (!manifest) return;

    const faultData: FaultData = {
      faultName
    };

    const [templates] = this.getTemplatesAndSteps(manifest);

    // Get install-chaos-faults template artifacts
    const installTemplateArtifacts = templates?.filter(template => template.name === 'install-chaos-faults')[0].inputs
      ?.artifacts;

    // Get experiment from install-chaos-faults template
    installTemplateArtifacts?.map(artifact => {
      if (artifact.name === faultName) {
        if (artifact.raw?.data) faultData['faultCR'] = parse(artifact.raw.data) as ChaosExperiment;
      }
    });

    // Get ChaosEngine CR form template
    templates?.map(template => {
      if (template.name === faultName) {
        if (template.inputs?.artifacts?.[0].raw?.data) {
          const chaosEngine = parse(template.inputs.artifacts[0].raw.data) as ChaosEngine;
          faultData['engineCR'] = chaosEngine;

          // Get probe details from manifest
          const probeRef = chaosEngine.metadata?.annotations?.probeRef;
          if (probeRef && probeRef !== '') {
            faultData.probes = JSON.parse(probeRef) as ProbeObj[];
          }
        }

        //Get Fault Weight from template
        if (template.metadata?.labels?.['weight']) faultData['weight'] = parseInt(template.metadata.labels['weight']);
      }
    });

    return faultData;
  }

  getFaultTunables(faultData: FaultData | undefined, operation?: GetFaultTunablesOperation): FaultTunables | undefined {
    let envs: EnvVar[] | undefined = [];
    const faultTunables: FaultTunables = {};

    if (operation === GetFaultTunablesOperation.InitialEnvs)
      envs = (faultData?.faultCR as ChaosExperiment)?.spec?.definition.env;
    else if (operation === GetFaultTunablesOperation.UpdatedEnvs)
      envs = faultData?.engineCR?.spec?.experiments[0]?.spec?.components?.env;

    envs?.map(env => {
      if (env.value !== undefined) {
        faultTunables[env.name] = {
          type: FaultTunableInputType.Text,
          value: env.value
        };
      } else if (env.valueFrom !== undefined) {
        const ref = env.valueFrom.secretKeyRef
          ? FaultTunableInputType.SecretKeyRef
          : FaultTunableInputType.ConfigMapKeyRef;
        faultTunables[env.name] = {
          type: ref,
          valueFrom: {
            name: env.valueFrom?.[ref].name,
            key: env.valueFrom?.[ref].name
          }
        };
      }
    });

    return faultTunables;
  }

  extractResilienceProbeDetails(
    manifest: KubernetesExperimentManifest | undefined,
    faultName: string
  ): ProbeObj[] | undefined {
    const [templates] = this.getTemplatesAndSteps(manifest);

    let probes: ProbeObj[] | undefined;

    templates?.map(template => {
      if (template.name === faultName) {
        if (!template.inputs?.artifacts?.[0].raw?.data) return;

        const chaosEngine = parse(template.inputs.artifacts[0].raw.data) as ChaosEngine;

        if (chaosEngine.metadata?.annotations?.probeRef)
          probes = JSON.parse(chaosEngine.metadata?.annotations?.probeRef) as ProbeObj[];
      }
    });

    return probes;
  }

  async doesProbeNameExist(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    faultName: string | undefined,
    probeName: string | undefined
  ): Promise<boolean> {
    try {
      const tx = (await this.db).transaction(ChaosObjectStoreNameMap.EXPERIMENTS, 'readwrite');
      const store = tx.objectStore(ChaosObjectStoreNameMap.EXPERIMENTS);
      const experiment = await store.get(key);
      if (!experiment || !probeName || !faultName) return false;

      const manifest = experiment?.manifest as KubernetesExperimentManifest;
      const [templates, ,] = this.getTemplatesAndSteps(manifest);

      templates?.map(template => {
        if (template.name === faultName) {
          const engineManifest = parse(template.inputs?.artifacts?.[0].raw?.data ?? '') as ChaosEngine;
          engineManifest.spec?.experiments?.[0].spec.probe?.map(probe => {
            if (probe.name === probeName) return true;
          });
        }
      });

      await tx.done;
      return false;
    } catch (_) {
      this.handleIDBFailure();
      return false;
    }
  }
  doesNodeSelectorExist(manifest: KubernetesExperimentManifest | undefined): [boolean, { key: string; value: string }] {
    if (!manifest) return [false, { key: '', value: '' }];

    let exists = false;
    let value = { key: '', value: '' };
    const [, , spec] = this.getTemplatesAndSteps(manifest);

    if (spec && spec.nodeSelector) {
      exists = true;
      const key = Object.keys(spec.nodeSelector);
      value = {
        key: key[0],
        value: spec.nodeSelector[key[0]]
      };
    }
    return [exists, value];
  }

  doesTolerationExist(manifest: KubernetesExperimentManifest | undefined): [boolean, WorkflowToleration] {
    let toleration = {
      effect: '',
      key: '',
      operator: '',
      value: ''
    };
    if (!manifest) return [false, toleration];

    let exists = false;
    const [, , spec] = this.getTemplatesAndSteps(manifest);

    if (spec && spec.tolerations) {
      exists = true;
      toleration = spec.tolerations[0];
    }
    return [exists, toleration];
  }

  updateFaultTunablesInFaultData(
    faultData: FaultData | undefined,
    faultTunables: FaultTunables | undefined
  ): FaultData | undefined {
    const chaosEngine = faultData?.engineCR;
    if (!chaosEngine || !faultTunables) return faultData;

    const envs: EnvVar[] = Object.entries(faultTunables).map(([envName, faultTunable]) => {
      return {
        name: envName,
        value: faultTunable.value?.toString(),
        valueFrom: faultTunable.valueFrom
      };
    });

    if (chaosEngine.spec?.experiments?.[0].spec.components?.env)
      chaosEngine.spec.experiments[0].spec.components.env = envs;

    return faultData;
  }

  async preProcessChaosEngineAndExperimentManifest(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    chaosEngine: ChaosEngine,
    chaosExperiment: ChaosExperiment
  ): Promise<{ chaosEngine: ChaosEngine; chaosExperiment: ChaosExperiment } | undefined> {
    try {
      const experiment = await (await this.db).get(ChaosObjectStoreNameMap.EXPERIMENTS, key);
      const experimentImagePullSecrets = experiment?.imageRegistry?.secret
        ? {
            experimentImagePullSecrets: [{ name: experiment.imageRegistry.secret }]
          }
        : undefined;

      const metadata = chaosEngine.metadata;
      if (metadata) {
        metadata.namespace = '{{workflow.parameters.adminModeNamespace}}';
        metadata['labels'] = {
          workflow_run_id: '{{ workflow.uid }}'
        };
        metadata.annotations = {
          probeRef: ''
        };
      }

      const engineSpec = chaosEngine.spec;
      const experimentSpec = chaosExperiment.spec;

      if (engineSpec) {
        engineSpec['chaosServiceAccount'] = 'litmus-admin';

        engineSpec.experiments[0].spec.components = {
          ...engineSpec.experiments[0].spec.components,

          env: [...(experimentSpec?.definition.env ?? [])],
          ...experimentImagePullSecrets
        };

        if (experiment?.imageRegistry?.secret) {
          engineSpec.components = {
            runner: {
              ...engineSpec.components?.runner,
              imagePullSecrets: [{ name: experiment.imageRegistry.secret }]
            }
          };
        }

        const annotationDetails = this.doesAnnotationExist(experiment?.manifest as KubernetesExperimentManifest);

        if (annotationDetails[0]) {
          const updatedEngineCR = this.updateAnnotationsInChaosEngine(chaosEngine, annotationDetails[1], false);
          if (updatedEngineCR) {
            chaosEngine = updatedEngineCR;
          }
        }
      }

      // if (experimentSpec) {
      //   experimentSpec.definition = {
      //     ...experimentSpec.definition,
      //     image: imageName
      //   };
      // }

      return { chaosEngine, chaosExperiment };
    } catch (_) {
      this.handleIDBFailure();
    }
  }

  private updateAnnotationsInChaosEngine(
    manifest: ChaosEngine | undefined,
    annotations: { [key: string]: string },
    remove: boolean
  ): ChaosEngine | undefined {
    if (!manifest?.spec) return;

    if (remove) {
      Object.entries(annotations).forEach(([key, _]) => {
        if (manifest.spec?.components?.runner?.runnerAnnotation)
          delete manifest.spec?.components?.runner?.runnerAnnotation[key];
        if (manifest.spec?.experiments[0].spec.components?.experimentAnnotations)
          delete manifest.spec.experiments[0].spec.components?.experimentAnnotations[key];
      });
      return manifest;
    }

    manifest.spec.components = {
      ...manifest.spec.components,
      runner: {
        runnerAnnotation: {
          ...annotations
        }
      }
    };
    manifest.spec.experiments[0].spec.components = {
      ...manifest.spec.experiments[0].spec.components,
      experimentAnnotations: {
        ...annotations
      }
    };

    return manifest;
  }

  doesAnnotationExist(manifest: KubernetesExperimentManifest | undefined): [boolean, { [key: string]: string }] {
    let annotations: { [key: string]: string } = {};
    if (!manifest) return [false, {}];

    let exists = false;
    const [, , spec] = this.getTemplatesAndSteps(manifest);

    if (spec && spec.podMetadata?.annotations && Object.keys(spec.podMetadata?.annotations).length) {
      exists = true;
      annotations = spec.podMetadata.annotations;
    }
    return [exists, annotations];
  }

  async preProcessChaosEngineManifest(
    key: ChaosObjectStoresPrimaryKeys['experiments'],
    chaosEngine: ChaosEngine,
    envs: EnvVar[]
  ): Promise<ChaosEngine | undefined> {
    try {
      const experiment = await (await this.db).get(ChaosObjectStoreNameMap.EXPERIMENTS, key);
      const imageRegistry = experiment?.imageRegistry?.repo ?? 'litmuschaos';
      const experimentImagePullSecrets = experiment?.imageRegistry?.secret
        ? {
            experimentImagePullSecrets: [{ name: experiment.imageRegistry.secret }]
          }
        : undefined;

      const probeImagePullSecrets = experiment?.imageRegistry?.secret
        ? {
            imagePullSecrets: [{ name: experiment.imageRegistry.secret }]
          }
        : undefined;

      const metadata = chaosEngine.metadata;
      if (metadata) {
        metadata.namespace = '{{workflow.parameters.adminModeNamespace}}';
        metadata['labels'] = {
          workflow_run_id: '{{ workflow.uid }}'
        };
      }

      const spec = chaosEngine.spec;
      if (spec) {
        const defaultCMDProbe = spec.experiments[0].spec.probe?.[0]['cmdProbe/inputs'];

        spec['chaosServiceAccount'] = 'litmus-admin';
        spec.experiments[0].spec.components = {
          env: [
            ...envs,
            {
              name: 'LIB_IMAGE',
              value: defaultCMDProbe?.['source']?.image?.replace('litmuschaos', imageRegistry)
            }
          ],
          ...experimentImagePullSecrets
        };

        if (defaultCMDProbe)
          defaultCMDProbe['source'] = {
            ...defaultCMDProbe['source'],
            ...probeImagePullSecrets,
            image: defaultCMDProbe['source']?.image?.replace('litmuschaos', imageRegistry)
          };
      }

      return chaosEngine;
    } catch (_) {
      this.handleIDBFailure();
    }
  }
}

const kubernetesYamlService = new KubernetesYamlService();

ExperimentFactory.registerInfrastructureTypeHandler(InfrastructureType.KUBERNETES, kubernetesYamlService);
