import { Type } from '@nestjs/common';
import { Field, InputType, ObjectType } from 'type-graphql';
import { getMetadataStorage } from '../metadata';

export function OmitObjectType<T, K extends keyof T>(TClass: Type<T>, ...fields: K[]): Type<Omit<T, K>> {
  const graphQLFields = getMetadataStorage().getTypeGraphqlFieldsForType(TClass);
  if (!(graphQLFields && graphQLFields.length)) {
    throw new Error(`Unable to find fields for type-graphql type ${TClass.name}`);
  }
  @ObjectType({ isAbstract: true })
  class Omitted {}
  graphQLFields
    .filter(f => !fields.includes(f.name as K))
    .forEach(f => Field(f.getType, f.typeOptions)(Omitted.prototype, f.name));
  return Omitted as Type<Omit<T, K>>;
}

export function OmitInputType<T, K extends keyof T>(TClass: Type<T>, ...fields: K[]): Type<Omit<T, K>> {
  const graphQLFields = getMetadataStorage().getTypeGraphqlFieldsForType(TClass);
  if (!(graphQLFields && graphQLFields.length)) {
    throw new Error(`Unable to find fields for type-graphql type ${TClass.name}`);
  }
  @InputType({ isAbstract: true })
  class Omitted {}
  graphQLFields
    .filter(f => !fields.includes(f.name as K))
    .forEach(f => Field(f.getType, f.typeOptions)(Omitted.prototype, f.name));
  return Omitted as Type<Omit<T, K>>;
}
