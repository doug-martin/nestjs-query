import { Field, InputType, ObjectType } from 'type-graphql';
import { Class } from '@nestjs-query/core';
import { getMetadataStorage } from '../metadata';

export function OmitObjectType<T, K extends keyof T>(TClass: Class<T>, ...fields: K[]): Class<Omit<T, K>> {
  const graphQLFields = getMetadataStorage().getTypeGraphqlFieldsForType(TClass);
  if (!(graphQLFields && graphQLFields.length)) {
    throw new Error(`Unable to find fields for type-graphql type ${TClass.name}`);
  }
  @ObjectType({ isAbstract: true })
  class Omitted {}
  graphQLFields
    .filter(f => !fields.includes(f.name as K))
    .forEach(f => Field(f.getType, f.typeOptions)(Omitted.prototype, f.name));
  return Omitted as Class<Omit<T, K>>;
}

export function OmitInputType<T, K extends keyof T>(TClass: Class<T>, ...fields: K[]): Class<Omit<T, K>> {
  const graphQLFields = getMetadataStorage().getTypeGraphqlFieldsForType(TClass);
  if (!(graphQLFields && graphQLFields.length)) {
    throw new Error(`Unable to find fields for type-graphql type ${TClass.name}`);
  }
  @InputType({ isAbstract: true })
  class Omitted {}
  graphQLFields
    .filter(f => !fields.includes(f.name as K))
    .forEach(f => Field(f.getType, f.typeOptions)(Omitted.prototype, f.name));
  return Omitted as Class<Omit<T, K>>;
}
