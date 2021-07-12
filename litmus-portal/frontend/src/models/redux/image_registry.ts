export interface ImageRegistryInfo {
  image_registry_name: string;
  image_repo_name: string;
  image_registry_type: string;
  secret_name: string;
  secret_namespace: string;
  enable_registry: boolean;
  update_registry: boolean;
  is_default: boolean;
}

export enum ImageRegistryActions {
  SELECT_IMAGE_REGISTRY = 'SELECT_IMAGE_REGISTRY',
}

interface ImageRegistryActionType<T, P> {
  type: T;
  payload: P;
}

export type ImageRegistryAction = ImageRegistryActionType<
  typeof ImageRegistryActions.SELECT_IMAGE_REGISTRY,
  ImageRegistryInfo
>;
