/* eslint-disable import/prefer-default-export */
import {
  ImageRegistryAction,
  ImageRegistryActions,
  ImageRegistryInfo,
} from '../../models/redux/image_registry';
import createReducer from './createReducer';

const initialState: ImageRegistryInfo = {
  image_registry_name: '',
  image_repo_name: '',
  image_registry_type: '',
  secret_name: '',
  secret_namespace: '',
  enable_registry: true,
};

export const selectedImageRegistry = createReducer<ImageRegistryInfo>(
  initialState,
  {
    [ImageRegistryActions.SELECT_IMAGE_REGISTRY](
      state: ImageRegistryInfo,
      action: ImageRegistryAction
    ) {
      return {
        ...state,
        ...action.payload,
      };
    },
  }
);

export default selectedImageRegistry;
