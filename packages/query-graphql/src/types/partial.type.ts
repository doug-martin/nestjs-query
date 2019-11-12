import { Type } from '@nestjs/common';
import { Field, InputType, ObjectType } from 'type-graphql';
import { getMetadataStorage } from '../metadata';

export function PartialType<T>(TClass: Type<T>): Type<Partial<T>> {
  const graphQLFields = getMetadataStorage().getTypeGraphqlFieldsForType(TClass);
  if (!(graphQLFields && graphQLFields.length)) {
    throw new Error(`Unable to find fields for type-graphql type ${TClass.name}`);
  }
  @ObjectType({ isAbstract: true })
  abstract class PartialObjectType {}
  graphQLFields.forEach(f =>
    Field(f.getType, { ...f.typeOptions, nullable: true })(PartialObjectType.prototype, f.name),
  );
  return PartialObjectType as Type<Partial<T>>;
}

export function PartialInputType<T>(TClass: Type<T>): Type<Partial<T>> {
  const graphQLFields = getMetadataStorage().getTypeGraphqlFieldsForType(TClass);
  if (!(graphQLFields && graphQLFields.length)) {
    throw new Error(`Unable to find fields for type-graphql type ${TClass.name}`);
  }
  @InputType({ isAbstract: true })
  class PartialInptType {}
  graphQLFields.forEach(f => Field(f.getType, { ...f.typeOptions, nullable: true })(PartialInptType.prototype, f.name));
  return PartialInptType as Type<Partial<T>>;
}
