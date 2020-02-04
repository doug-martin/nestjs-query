import { Class, Filter } from '@nestjs-query/core';
import { InputType, Field } from 'type-graphql';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { getMetadataStorage } from '../../metadata';
import { createFilterComparisonType } from './field-comparison';
import { UnregisteredObjectType } from '../type.errors';

export function FilterType<T>(TClass: Class<T>): Class<Filter<T>> {
  const metadataStorage = getMetadataStorage();
  const existing = metadataStorage.getFilterType<T>(TClass);
  if (existing) {
    return existing;
  }
  const objMetadata = metadataStorage.getTypeGraphqlObjectMetadata(TClass);
  if (!objMetadata) {
    throw new UnregisteredObjectType(TClass, 'No fields found to create FilterType.');
  }
  const prefix = objMetadata.name;
  const fields = metadataStorage.getFilterableObjectFields(TClass);
  if (!fields) {
    throw new Error(`No fields found to create GraphQLFilter for ${TClass.name}`);
  }

  @InputType(`${prefix}Filter`)
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
  metadataStorage.addFilterType(TClass, GraphQLFilter as Class<Filter<T>>);
  return GraphQLFilter as Class<Filter<T>>;
}
