import { Class, SortDirection, SortField, SortNulls } from '@nestjs-query/core';
import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsIn } from 'class-validator';
import { getMetadataStorage } from '../../metadata';
import { IsUndefined } from '../validators';
import { UnregisteredObjectType } from '../type.errors';

registerEnumType(SortDirection, {
  name: 'SortDirection', // this one is mandatory
  description: 'Sort Directions', // this one is optional
});

registerEnumType(SortNulls, {
  name: 'SortNulls', // this one is mandatory
  description: 'Sort Nulls Options', // this one is optional
});

export function SortType<T>(TClass: Class<T>): Class<SortField<T>> {
  const metadataStorage = getMetadataStorage();
  const existing = metadataStorage.getSortType<T>(TClass);
  if (existing) {
    return existing;
  }
  const objMetadata = metadataStorage.getGraphqlObjectMetadata(TClass);
  if (!objMetadata) {
    throw new UnregisteredObjectType(TClass, 'Unable to make SortType.');
  }
  const fields = metadataStorage.getFilterableObjectFields(TClass);
  if (!fields) {
    throw new Error(
      `No fields found to create SortType for ${TClass.name}. Ensure fields are annotated with @FilterableField`,
    );
  }
  const prefix = objMetadata.name;
  const fieldNames = fields.map((f) => f.propertyName);
  const fieldNameMap = fieldNames.reduce((acc, f) => ({ ...acc, [f]: f }), {});
  registerEnumType(fieldNameMap, { name: `${prefix}SortFields` });
  @InputType(`${prefix}Sort`)
  class Sort {
    @Field(() => fieldNameMap)
    @IsIn(fieldNames)
    field!: keyof T;

    @Field(() => SortDirection)
    @IsEnum(SortDirection)
    direction!: SortDirection;

    @Field(() => SortNulls, { nullable: true })
    @IsUndefined()
    @IsEnum(SortNulls)
    nulls?: SortNulls;
  }
  metadataStorage.addSortType(TClass, Sort);
  return Sort;
}
