import { getImageRegistry } from '@api/core/ImageRegistry';
import { getScope } from '@utils';
import type { ImageRegistry } from '@db';

// Default image registry configuration
const DEFAULT_IMAGE_REGISTRY = {
  name: 'docker.io/litmuschaos',
  repo: 'litmuschaos',
  secret: ''
} as const;

export function useImageRegistry(): { imageRegistry: ImageRegistry | undefined; loading: boolean } {
  const scope = getScope();
  
  // Fetch imageRegistry data
  const { data: getImageRegistryData, loading } = getImageRegistry({
    projectID: scope.projectID
  });

  // Create imageRegistry object with fallback values
  const imageRegistry = getImageRegistryData?.getImageRegistry ? {
    name: getImageRegistryData.getImageRegistry.imageRegistryInfo.imageRegistryName,
    repo: getImageRegistryData.getImageRegistry.imageRegistryInfo.imageRepoName,
    secret: getImageRegistryData.getImageRegistry.imageRegistryInfo.secretName,
  } : DEFAULT_IMAGE_REGISTRY;

  return { imageRegistry, loading };
}
