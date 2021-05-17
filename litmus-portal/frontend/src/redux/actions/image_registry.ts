import {
  ImageRegistryAction,
  ImageRegistryActions,
  ImageRegistryInfo,
} from '../../models/redux/image_registry';

export const selectImageRegistry = (
  data: ImageRegistryInfo
): ImageRegistryAction => {
  return {
    type: ImageRegistryActions.SELECT_IMAGE_REGISTRY,
    payload: data,
  };
};

export default selectImageRegistry;
