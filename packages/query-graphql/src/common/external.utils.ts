import { LazyMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage';
import { ObjectTypeMetadata } from '@nestjs/graphql/dist/schema-builder/metadata/object-type.metadata';
import { EnumMetadata } from '@nestjs/graphql/dist/schema-builder/metadata';
import { Class } from '@nestjs-query/core';
import { TypeMetadataStorage } from '@nestjs/graphql';
import { UnregisteredObjectType } from '../types/type.errors';

/**
 * @internal
 */
export function findGraphqlObjectMetadata<T>(objType: Class<T>): ObjectTypeMetadata | undefined {
  return TypeMetadataStorage.getObjectTypesMetadata().find((o) => o.target === objType);
}

export function getGraphqlObjectMetadata<T>(objType: Class<T>, notFoundMsg: string): ObjectTypeMetadata {
  const metadata = findGraphqlObjectMetadata(objType);
  if (!metadata) {
    throw new UnregisteredObjectType(objType, notFoundMsg);
  }
  return metadata;
}

export function getGraphqlObjectName<DTO>(DTOClass: Class<DTO>, notFoundMsg: string): string {
  return getGraphqlObjectMetadata(DTOClass, notFoundMsg).name;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function getGraphqlEnumMetadata(objType: object): EnumMetadata | undefined {
  // hack to get enums loaded it may break in the future :(
  LazyMetadataStorage.load();
  return TypeMetadataStorage.getEnumsMetadata().find((o) => o.ref === objType);
}
