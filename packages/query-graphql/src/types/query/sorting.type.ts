import { Class, SortDirection, SortField, SortNulls, ValueReflector } from '@nestjs-query/core';
import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsIn } from 'class-validator';
import { IsUndefined } from '../validators';
import { getFilterableFields } from '../../decorators';
import { getGraphqlObjectName } from '../../common';

registerEnumType(SortDirection, {
  name: 'SortDirection', // this one is mandatory
  description: 'Sort Directions', // this one is optional
});

registerEnumType(SortNulls, {
  name: 'SortNulls', // this one is mandatory
  description: 'Sort Nulls Options', // this one is optional
});

const reflector = new ValueReflector('nestjs-query:sort-type');

export function getOrCreateSortType<T>(TClass: Class<T>): Class<SortField<T>> {
  return reflector.memoize(TClass, () => {
    const prefix = getGraphqlObjectName(TClass, 'Unable to make SortType.');
    const fields = getFilterableFields(TClass);
    if (!fields.length) {
      throw new Error(
        `No fields found to create SortType for ${TClass.name}. Ensure fields are annotated with @FilterableField`,
      );
    }
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
    return Sort;
  });
}
