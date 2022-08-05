import { useLazyQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import WorkflowStepper from '../../components/WorkflowStepper';
import { constants } from '../../constants';
import Wrapper from '../../containers/layouts/Wrapper';
import {
  GET_IMAGE_REGISTRY,
  LIST_IMAGE_REGISTRY_BY_PROJECT_ID,
} from '../../graphql/queries/imageRegistry';
import useActions from '../../redux/actions';
import * as ImageRegistryActions from '../../redux/actions/image_registry';
import { getProjectID } from '../../utils/getSearchParams';

const CreateWorkflow = () => {
  const selectedProjectID = getProjectID();
  const imageRegistry = useActions(ImageRegistryActions);

  const [getRegistryData] = useLazyQuery(GET_IMAGE_REGISTRY, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data !== undefined) {
        const regData = data.getImageRegistry.imageRegistryInfo;
        imageRegistry.selectImageRegistry({
          image_registry_name: regData.imageRegistryName,
          image_repo_name: regData.imageRepoName,
          image_registry_type: regData.imageRegistryType,
          secret_name: regData.secretName,
          secret_namespace: regData.secretNamespace,
          enable_registry: regData.enableRegistry,
          is_default: regData.isDefault,
          update_registry: true,
        });
      }
    },
  });

  const [listImageRegistry] = useLazyQuery(LIST_IMAGE_REGISTRY_BY_PROJECT_ID, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (
        data.listImageRegistry !== null &&
        data.listImageRegistry.length > 0
      ) {
        getRegistryData({
          variables: {
            imageRegistryID: data.listImageRegistry[0].imageRegistryID,
            projectID: selectedProjectID,
          },
        });
      } else {
        imageRegistry.selectImageRegistry({
          image_registry_name: constants.dockerio,
          image_repo_name: constants.litmus,
          image_registry_type: constants.public,
          secret_name: '',
          secret_namespace: '',
          is_default: true,
          enable_registry: true,
          update_registry: true,
        });
      }
    },
  });

  useEffect(() => {
    listImageRegistry({
      variables: {
        data: selectedProjectID,
      },
    });
  }, []);

  return (
    <Wrapper>
      <WorkflowStepper />
    </Wrapper>
  );
};

export default CreateWorkflow;
