import { InfrastructureType } from '@api/entities';
import type { ExperimentManifest } from '@models';

export function getInfrastructureTypeFromExperimentKind(manifest: ExperimentManifest | undefined): InfrastructureType {
  if (!manifest) return InfrastructureType.KUBERNETES;
  switch (manifest.kind) {
    case 'Workflow':
    case 'CronWorkflow':
      return InfrastructureType.KUBERNETES;
    default:
      return InfrastructureType.KUBERNETES;
  }
}
