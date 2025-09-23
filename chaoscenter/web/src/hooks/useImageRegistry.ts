import { getImageRegistry } from '@api/core/ImageRegistry';
import { getScope } from '@utils';
import type { ImageRegistry } from '@db';

export function useImageRegistry(): { imageRegistry: ImageRegistry; loading: boolean } {
  const scope = getScope();
  
  // Fetch imageRegistry data
  const { data: getImageRegistryData, loading } = getImageRegistry({
    projectID: scope.projectID,
    options: {
      fetchPolicy: 'cache-first'
    }
  });

  // Create imageRegistry object with fallback values
  const imageRegistry = getImageRegistryData?.getImageRegistry?.imageRegistryInfo ? {
    name: getImageRegistryData.getImageRegistry.imageRegistryInfo.imageRegistryName,
    repo: getImageRegistryData.getImageRegistry.imageRegistryInfo.imageRepoName,
    secret: getImageRegistryData.getImageRegistry.imageRegistryInfo.secretName,
    server: getImageRegistryData.getImageRegistry.imageRegistryInfo.imageRegistryName
  } : {
    server: 'docker.io/litmuschaos',
    repo: 'litmuschaos',
    secret: ''
  };

  return { imageRegistry, loading };
}
