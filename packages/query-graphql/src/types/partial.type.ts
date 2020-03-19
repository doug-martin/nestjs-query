import { Class } from '@nestjs-query/core';
import { Field, ObjectType, InputType } from '@nestjs/graphql';
import { getMetadataStorage } from '../metadata';

export function PartialType<T>(TClass: Class<T>): Class<Partial<T>> {
  const graphQLFields = getMetadataStorage().getGraphqlFieldsForType(TClass);
  if (!(graphQLFields && graphQLFields.length)) {
    throw new Error(`Unable to find fields for graphql type ${TClass.name}`);
  }
  @ObjectType({ isAbstract: true })
  abstract class PartialObjectType {}
  graphQLFields.forEach(f => Field(f.typeFn, { ...f.options, nullable: true })(PartialObjectType.prototype, f.name));
  return PartialObjectType as Class<Partial<T>>;
}

export function PartialInputType<T>(TClass: Class<T>): Class<Partial<T>> {
  const graphQLFields = getMetadataStorage().getGraphqlFieldsForType(TClass);
  if (!(graphQLFields && graphQLFields.length)) {
    throw new Error(`Unable to find fields for graphql type ${TClass.name}`);
  }
  @InputType({ isAbstract: true })
  class PartialInptType {}
  graphQLFields.forEach(f => Field(f.typeFn, { ...f.options, nullable: true })(PartialInptType.prototype, f.name));
  return PartialInptType as Class<Partial<T>>;
}
