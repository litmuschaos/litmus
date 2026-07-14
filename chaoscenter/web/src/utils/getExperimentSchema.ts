import { InfrastructureType } from '@api/entities';
import kubernetesExperimentSchema from 'models/kubernetesExperimentSchema';

export function getExperimentSchema(infrastructureType: InfrastructureType | undefined): Record<string, unknown> {
  switch (infrastructureType) {
    case InfrastructureType.KUBERNETES:
      return kubernetesExperimentSchema;
    default:
      return kubernetesExperimentSchema;
  }
}
