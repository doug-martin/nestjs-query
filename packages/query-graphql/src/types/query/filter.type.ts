import { Class, Filter } from '@nestjs-query/core';
import { InputType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { getMetadataStorage } from '../../metadata';
import { createFilterComparisonType } from './field-comparison';
import { UnregisteredObjectType } from '../type.errors';

function getOrCreateFilterType<T>(TClass: Class<T>, name: string): Class<Filter<T>> {
  const metadataStorage = getMetadataStorage();
  const existing = metadataStorage.getFilterType<T>(name);
  if (existing) {
    return existing;
  }
  const fields = metadataStorage.getFilterableObjectFields(TClass);
  if (!fields) {
    throw new Error(`No fields found to create GraphQLFilter for ${TClass.name}`);
  }

  @InputType(name)
  class GraphQLFilter {
    @ValidateNested()
    @Field(() => [GraphQLFilter], { nullable: true })
    @Type(() => GraphQLFilter)
    and?: Filter<T>[];

    @ValidateNested()
    @Field(() => [GraphQLFilter], { nullable: true })
    @Type(() => GraphQLFilter)
    or?: Filter<T>[];
  }

  fields.forEach(({ propertyName, target, returnTypeFunc }) => {
    const FC = createFilterComparisonType(target, returnTypeFunc);
    ValidateNested()(GraphQLFilter.prototype, propertyName);
    Field(() => FC, { nullable: true })(GraphQLFilter.prototype, propertyName);
    Type(() => FC)(GraphQLFilter.prototype, propertyName);
  });
  metadataStorage.addFilterType(name, GraphQLFilter as Class<Filter<T>>);
  return GraphQLFilter as Class<Filter<T>>;
}

function getObjectTypeName<DTO>(DTOClass: Class<DTO>): string {
  const objMetadata = getMetadataStorage().getGraphqlObjectMetadata(DTOClass);
  if (!objMetadata) {
    throw new UnregisteredObjectType(DTOClass, 'No fields found to create FilterType.');
  }
  return objMetadata.name;
}

export function FilterType<T>(TClass: Class<T>): Class<Filter<T>> {
  return getOrCreateFilterType(TClass, `${getObjectTypeName(TClass)}Filter`);
}

export function DeleteFilterType<T>(TClass: Class<T>): Class<Filter<T>> {
  return getOrCreateFilterType(TClass, `${getObjectTypeName(TClass)}DeleteFilter`);
}

export function UpdateFilterType<T>(TClass: Class<T>): Class<Filter<T>> {
  return getOrCreateFilterType(TClass, `${getObjectTypeName(TClass)}UpdateFilter`);
}

export function SubscriptionFilterType<T>(TClass: Class<T>): Class<Filter<T>> {
  return getOrCreateFilterType(TClass, `${getObjectTypeName(TClass)}SubscriptionFilter`);
}
