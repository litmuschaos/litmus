import { IDBPDatabase, openDB } from 'idb';
import { ChaosDBData, ChaosObjectStore, ChaosObjectStoreNameMap } from './types';

export class ChaosIDB {
  private database = 'chaos-db';
  public db: Promise<IDBPDatabase<ChaosDBData>>;
  private objectStores: ChaosObjectStore[] = [
    {
      name: ChaosObjectStoreNameMap.EXPERIMENTS,
      options: {
        autoIncrement: false
      }
    }
  ];

  constructor() {
    this.db = this.createObjectStore(this.objectStores);
  }

  private async createObjectStore(objectStores: ChaosObjectStore[]): Promise<IDBPDatabase<ChaosDBData>> {
    return await openDB<ChaosDBData>(this.database, 1, {
      upgrade(db) {
        for (const store of objectStores) {
          if (db.objectStoreNames.contains(store.name)) {
            continue;
          }
          const dbStore = db.createObjectStore(store.name, store.options);
          if (store.index) {
            const { name, keyPath, options } = store.index;
            dbStore.createIndex(name, keyPath, options);
          }
        }
      }
    });
  }

  public handleIDBFailure(): void {
    if (
      confirm(
        'Error occurred while performing an operation. Reloading the page might help. Do you want to reload the page?'
      ) == true
    ) {
      window.location.reload();
    }
  }

  public async closeDB(): Promise<void> {
    try {
      (await this.db).close();
    } catch (error) {
      this.handleIDBFailure();
    }
  }

  public async clearObjectStore(storeName: ChaosObjectStore['name']): Promise<void> {
    try {
      (await this.db).clear(storeName);
    } catch (error) {
      this.handleIDBFailure();
    }
  }
}
