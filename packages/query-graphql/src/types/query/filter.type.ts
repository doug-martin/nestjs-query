import { Filter } from '@nestjs-query/core';
import { InputType, Field } from 'type-graphql';
import { Type } from '@nestjs/common';
import { Type as TransformType } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { getMetadataStorage } from '../../metadata';
import { createFilterComparisonType } from './field-comparison';

export function GraphQLFilterType<T>(TClass: Type<T>): Type<Filter<T>> {
  const metadataStorage = getMetadataStorage();
  const objMetadata = metadataStorage.getTypeGraphqlObjectMetadata(TClass);
  if (!objMetadata) {
    throw new Error(`unable to make filter for class not registered with type-graphql ${TClass.name}`);
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
    @TransformType(() => GraphQLFilter)
    and?: Filter<T>[];

    @ValidateNested()
    @Field(() => [GraphQLFilter], { nullable: true })
    @TransformType(() => GraphQLFilter)
    or?: Filter<T>[];
  }

  fields.forEach(({ propertyName, type, returnTypeFunc }) => {
    const FC = createFilterComparisonType(type, returnTypeFunc);
    ValidateNested()(GraphQLFilter.prototype, propertyName);
    Field(() => FC, { nullable: true })(GraphQLFilter.prototype, propertyName);
    TransformType(() => FC)(GraphQLFilter.prototype, propertyName);
  });
  return GraphQLFilter as Type<Filter<T>>;
}
