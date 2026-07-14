export interface ImageRegistryInfo {
  isDefault: boolean;
  imageRegistryName: string;
  imageRepoName: string;
  imageRegistryType: ImageRegistryType;
  secretName: string;
  secretNamespace: string;
  enableRegistry: boolean;
}

export enum ImageRegistryType {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

export interface ImageRegistry {
  imageRegistryInfo: ImageRegistryInfo;
  imageRegistryID: string;
  projectID: string;
  updatedAt: string;
  createdAt: string;
  isRemoved: boolean;
}

export interface CreateImageRegistryResponse {
  createImageRegistry: ImageRegistry;
}

export interface GetImageRegistryResponse {
  getImageRegistry: ImageRegistry;
}

export interface ListImageRegistryResponse {
  listImageRegistry: ImageRegistry[];
}

export interface UpdateImageRegistryResponse {
  updateImageRegistry: ImageRegistry;
}

export interface AddImageRegistryRequest {
  projectID: string;
  imageRegistryInfo: ImageRegistryInfo;
}
