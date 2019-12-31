import { GraphQLQueryMetadataStorage } from './metadataStorage';

let storage: GraphQLQueryMetadataStorage;
export function getMetadataStorage(): GraphQLQueryMetadataStorage {
  if (!storage) {
    storage = new GraphQLQueryMetadataStorage();
  }
  return storage;
}
