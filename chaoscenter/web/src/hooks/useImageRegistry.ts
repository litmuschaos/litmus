import { getImageRegistry } from '@api/core/ImageRegistry';
import type { ImageRegistry } from '@db';
import { useAppStore } from './useAppStore';

// Default image registry configuration
const DEFAULT_IMAGE_REGISTRY = {
  name: 'docker.io',
  repo: 'litmuschaos',
  secret: ''
} as const;

export function useImageRegistry(): { imageRegistry: ImageRegistry | undefined; loading: boolean } {
  const { projectID } = useAppStore();
  
  // Fetch imageRegistry data
  const { data: getImageRegistryData, loading } = getImageRegistry({
    projectID: projectID ?? ''
  });

  // Create imageRegistry object with fallback values
  const imageRegistry = getImageRegistryData?.getImageRegistry ? {
    name: getImageRegistryData.getImageRegistry.imageRegistryInfo.imageRegistryName,
    repo: getImageRegistryData.getImageRegistry.imageRegistryInfo.imageRepoName,
    secret: getImageRegistryData.getImageRegistry.imageRegistryInfo.secretName,
  } : DEFAULT_IMAGE_REGISTRY;

  return { imageRegistry, loading };
}
