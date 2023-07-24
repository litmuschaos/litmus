import React from 'react';
import ImageRegistryView from '@views/ImageRegistry/ImageRegistry';
import { getScope } from '@utils';
import { getImageRegistry } from '@api/core/ImageRegistry';
import Loader from '@components/Loader';

const ImageRegistryController: React.FC = () => {
  const scope = getScope();
  const { data: getImageRegistryData, loading: getImageRegistryLoading } = getImageRegistry({
    projectID: scope.projectID,
    options: {
      // eslint-disable-next-line no-console
      onError: error => console.error(error.message),
      nextFetchPolicy: 'cache-first'
    }
  });

  return (
    <Loader loading={getImageRegistryLoading}>
      {getImageRegistryData && (
        <ImageRegistryView
          getImageRegistryData={getImageRegistryData?.getImageRegistry.imageRegistryInfo}
          loading={{ getImageRegistry: getImageRegistryLoading }}
        />
      )}
    </Loader>
  );
};

export default ImageRegistryController;
