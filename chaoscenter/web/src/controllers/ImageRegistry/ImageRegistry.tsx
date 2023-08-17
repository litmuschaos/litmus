import React from 'react';
import { useToaster } from '@harnessio/uicore';
import { getScope } from '@utils';
import { getImageRegistry } from '@api/core/ImageRegistry';
import { addImageRegistry } from '@api/core/ImageRegistry/addImageRegistry';
import { updateImageRegistry } from '@api/core/ImageRegistry/updateImageRegistry';
import ImageRegistryView from '@views/ImageRegistry';
import Loader from '@components/Loader';

const ImageRegistryController: React.FC = () => {
  const scope = getScope();
  const { showError } = useToaster();
  const {
    data: getImageRegistryData,
    loading: getImageRegistryLoading,
    refetch: listImageRegistryRefetch
  } = getImageRegistry({
    projectID: scope.projectID,
    options: {
      onError: err => showError(err.message),
      nextFetchPolicy: 'cache-first'
    }
  });

  const [addImageRegistryMutation, { loading: addImageRegistryMutationLoading }] = addImageRegistry({
    onCompleted: () => {
      listImageRegistryRefetch();
    },
    onError: err => showError(err.message)
  });

  const [updateImageRegistryMutation, { loading: updateImageRegistryMutationLoading }] = updateImageRegistry({
    onCompleted: () => {
      listImageRegistryRefetch();
    },
    onError: (err: {
      message: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined;
    }) => showError(err.message)
  });
  return (
    <Loader loading={getImageRegistryLoading}>
      <ImageRegistryView
        listImageRegistryRefetch={listImageRegistryRefetch}
        getImageRegistryData={getImageRegistryData?.getImageRegistry}
        loading={{
          getImageRegistry: getImageRegistryLoading,
          addImageRegistryMutationLoading: addImageRegistryMutationLoading,
          updateImageRegistryMutationLoading: updateImageRegistryMutationLoading
        }}
        updateImageRegistryMutation={updateImageRegistryMutation}
        addImageRegistryMutation={addImageRegistryMutation}
      />
    </Loader>
  );
};

export default ImageRegistryController;
