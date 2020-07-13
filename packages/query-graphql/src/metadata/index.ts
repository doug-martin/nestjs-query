import { GraphQLQueryMetadataStorage } from './metadata-storage';

export { FilterableFieldDescriptor } from './metadata-storage';

/** @internal */
let storage: GraphQLQueryMetadataStorage;
/** @internal */
export function getMetadataStorage(): GraphQLQueryMetadataStorage {
  if (!storage) {
    storage = new GraphQLQueryMetadataStorage();
  }
  return storage;
}
