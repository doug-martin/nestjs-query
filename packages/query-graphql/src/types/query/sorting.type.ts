import 'reflect-metadata';
import { SortDirection, SortField, SortNulls } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { Field, InputType, registerEnumType } from 'type-graphql';
import { IsEnum, IsIn } from 'class-validator';
import { getMetadataStorage } from '../../metadata';
import { IsUndefined } from '../validators';

registerEnumType(SortDirection, {
  name: 'SortDirection', // this one is mandatory
  description: 'Sort Directions', // this one is optional
});

registerEnumType(SortNulls, {
  name: 'SortNulls', // this one is mandatory
  description: 'Sort Nulls Options', // this one is optional
});

export const GraphQLSortType = <T>(TClass: Type<T>): Type<SortField<T>> => {
  const metadataStorage = getMetadataStorage();
  const objMetadata = metadataStorage.getTypeGraphqlObjectMetadata(TClass);
  if (!objMetadata) {
    throw new Error(`unable to make sort for class not registered with type-graphql ${TClass.name}`);
  }
  const fields = metadataStorage.getFilterableObjectFields(TClass);
  if (!fields) {
    throw new Error(`No fields found to create Sort for ${TClass.name}`);
  }
  const prefix = objMetadata.name;
  const fieldNames = fields.map(f => f.propertyName);
  const fieldNameMap = fieldNames.reduce((acc, f) => ({ ...acc, [f]: f }), {});
  registerEnumType(fieldNameMap, { name: `${prefix}SortFields` });
  @InputType(`${prefix}Sort`)
  class Sort {
    @Field(() => fieldNameMap)
    @IsIn(fieldNames)
    field: keyof T;

    @Field(() => SortDirection)
    @IsEnum(SortDirection)
    direction: SortDirection;

    @Field(() => SortNulls, { nullable: true })
    @IsUndefined()
    @IsEnum(SortNulls)
    nulls?: SortNulls;
  }

  return Sort;
};
