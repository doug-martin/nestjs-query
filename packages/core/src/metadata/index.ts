import { CoreQueryMetadataStorage } from './metadata-storage';

/** @internal */
let storage: CoreQueryMetadataStorage;
/** @internal */
export function getCoreMetadataStorage(): CoreQueryMetadataStorage {
  if (!storage) {
    storage = new CoreQueryMetadataStorage();
  }
  return storage;
}
