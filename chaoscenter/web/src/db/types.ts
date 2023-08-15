import type { DBSchema } from 'idb';
import type { ExperimentManifest } from '@models';

export interface ChaosObjectStoresPrimaryKeys {
  experiments: string;
}

export interface ChaosObjectStore {
  // Add other object store names like so: name: 'experiments' | 'probes' | 'chaoshubs';
  name: 'experiments';
  options?: IDBObjectStoreParameters;
  index?: {
    name: string;
    keyPath: string | string[];
    options?: IDBIndexParameters;
  };
}

export enum ChaosObjectStoreNameMap {
  EXPERIMENTS = 'experiments'
}

export interface ChaosDBData extends DBSchema {
  experiments: {
    key: ChaosObjectStoresPrimaryKeys['experiments'];
    value: Experiment;
    indexes: { [s: string]: IDBValidKey };
  };
}

interface CommonDBAttributes {
  unsavedChanges?: boolean;
}

export interface ServiceIdentifiers {
  serviceIdentifiers: string[];
}

export interface ImageRegistry {
  repo: string;
  secret: string;
}

export interface ExperimentMetadata extends CommonDBAttributes {
  id?: string;
  name: string;
  description?: string;
  tags?: Array<string>;
  chaosInfrastructure: {
    id?: string;
    namespace?: string;
    environmentID?: string;
  };
  imageRegistry?: ImageRegistry;
}

export interface Experiment extends ExperimentMetadata {
  manifest?: ExperimentManifest;
}
