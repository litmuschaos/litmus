export interface ImageRegistryInfo {
  isDefault: boolean;
  imageRegistryName: string;
  imageRepoName: string;
  imageRegistryType: string;
  secretName: string;
  secretNamespace: string;
  enableRegistry: boolean;
}

export interface ImageRegistry {
  isDefualt: boolean;
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
