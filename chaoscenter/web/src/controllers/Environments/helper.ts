import type { Environment } from '@api/entities';
import type { EnvironmentDetails } from './types';

export function generateEnvironmentTableContent(environmentData: Array<Environment>): Array<EnvironmentDetails> {
  const content: EnvironmentDetails[] = environmentData.map(individualEnvironment => {
    return {
      environmentID: individualEnvironment.environmentID,
      name: individualEnvironment.name,
      description: individualEnvironment.description ?? '',
      tags: individualEnvironment.tags,
      type: individualEnvironment.type,
      updatedAt: parseInt(individualEnvironment.updatedAt ?? ''),
      updatedBy: individualEnvironment.updatedBy,
      infraIds: individualEnvironment.infraIDs
    };
  });
  return content;
}
