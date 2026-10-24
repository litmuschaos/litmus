import { FaultTunableInputType } from '@models';
import type { FaultData } from '@models';
import type { EnvVar } from '../../../models/k8s';
import { GetFaultTunablesOperation } from '../ExperimentYamlService';
import { KubernetesYamlService } from '../KubernetesYamlService';

jest.mock('@db', () => ({ ChaosIDB: class {} }));
jest.mock('@utils', () => ({ yamlStringify: jest.fn() }));

describe('KubernetesYamlService.getFaultTunables', () => {
  const service = new KubernetesYamlService();
  const operations = [GetFaultTunablesOperation.InitialEnvs, GetFaultTunablesOperation.UpdatedEnvs];

  function faultData(env: EnvVar[]): FaultData {
    return {
      faultName: 'pod-delete',
      faultCR: { spec: { definition: { env } } },
      engineCR: { spec: { experiments: [{ spec: { components: { env } } }] } }
    } as FaultData;
  }

  describe.each(operations)('%s', operation => {
    test.each([FaultTunableInputType.SecretKeyRef, FaultTunableInputType.ConfigMapKeyRef])(
      'preserves the resource name and its distinct %s key',
      ref => {
        const reference = { name: 'fault-settings', key: 'duration' };
        const data = faultData([{ name: 'TOTAL_CHAOS_DURATION', valueFrom: { [ref]: reference } }]);

        expect(service.getFaultTunables(data, operation)).toEqual({
          TOTAL_CHAOS_DURATION: { type: ref, valueFrom: reference }
        });
      }
    );

    test('keeps literal environment values unchanged', () => {
      const data = faultData([{ name: 'TOTAL_CHAOS_DURATION', value: '30' }]);

      expect(service.getFaultTunables(data, operation)).toEqual({
        TOTAL_CHAOS_DURATION: { type: FaultTunableInputType.Text, value: '30' }
      });
    });

    test('returns no tunables for an empty environment list', () => {
      expect(service.getFaultTunables(faultData([]), operation)).toEqual({});
    });
  });
});
