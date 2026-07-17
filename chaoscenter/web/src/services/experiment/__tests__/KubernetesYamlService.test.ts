import { parse } from 'yaml';

import { ChaosObjectStoreNameMap } from '@db';
import type { Experiment } from '@db';
import type { ChaosEngine } from '@models';
import { KubernetesYamlService } from '../KubernetesYamlService';

describe('KubernetesYamlService tolerations', () => {
  const experimentKey = 'toleration-regression-test';
  let service: KubernetesYamlService;

  beforeEach(async () => {
    service = new KubernetesYamlService();
    await service.clearObjectStore(ChaosObjectStoreNameMap.EXPERIMENTS);

    const experiment = {
      id: experimentKey,
      name: experimentKey,
      chaosInfrastructure: {},
      manifest: {
        kind: 'Workflow',
        metadata: { name: experimentKey },
        spec: {
          entrypoint: 'custom-chaos',
          templates: [
            {
              name: 'custom-chaos',
              steps: []
            },
            {
              name: 'install-chaos-faults',
              inputs: {
                artifacts: [
                  {
                    raw: {
                      data: `
                        apiVersion: litmuschaos.io/v1alpha1
                        kind: ChaosEngine
                        spec:
                          components:
                            runner: {}
                          experiments:
                            - name: pod-http-status-code
                              spec:
                                components: {}
                      `
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    } as unknown as Experiment;

    await (await service.db).put(ChaosObjectStoreNameMap.EXPERIMENTS, experiment, experimentKey);
  });

  afterEach(async () => {
    await service.clearObjectStore(ChaosObjectStoreNameMap.EXPERIMENTS);
    await service.closeDB();
  });

  test('serializes runner and experiment tolerations as arrays', async () => {
    await service.updateToleration(
      experimentKey,
      {
        effect: 'NoExecute',
        key: 'dedicated',
        operator: 'Equal',
        value: 'my-node-tag'
      },
      false
    );

    const experiment = await service.getExperiment(experimentKey);
    const templates = (
      experiment?.manifest as {
        spec: { templates: Array<{ name: string; inputs?: { artifacts?: Array<{ raw?: { data?: string } }> } }> };
      }
    ).spec.templates;
    const engineArtifact = templates.find(template => template.name === 'install-chaos-faults')?.inputs?.artifacts?.[0]
      ?.raw?.data;
    const engine = parse(engineArtifact ?? '') as ChaosEngine;
    const runnerTolerations = engine.spec?.components?.runner?.tolerations;
    const experimentTolerations = engine.spec?.experiments[0].spec.components?.tolerations;

    expect(Array.isArray(runnerTolerations)).toBe(true);
    expect(Array.isArray(experimentTolerations)).toBe(true);
    expect(runnerTolerations).toHaveLength(1);
    expect(experimentTolerations).toHaveLength(1);

    expect(runnerTolerations?.[0]).toEqual({
      effect: 'NoExecute',
      key: 'dedicated',
      operator: 'Equal',
      value: 'my-node-tag'
    });
    expect(experimentTolerations?.[0]).toEqual({
      effect: 'NoExecute',
      key: 'dedicated',
      operator: 'Equal',
      value: 'my-node-tag'
    });
  });
});
