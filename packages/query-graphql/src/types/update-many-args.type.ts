import { DeepPartial, Filter, Class } from '@nestjs-query/core';
import { Field, ArgsType } from 'type-graphql';
import { IsNotEmptyObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export interface UpdateManyArgsType<T, U extends DeepPartial<T>> {
  filter: Filter<T>;
  input: U;
}

export function UpdateManyArgsType<T, U extends DeepPartial<T>>(
  FilterType: Class<Filter<T>>,
  UpdateType: Class<U>,
): Class<UpdateManyArgsType<T, U>> {
  @ArgsType()
  class UpdateManyArgs implements UpdateManyArgsType<T, U> {
    @IsNotEmptyObject()
    @Field(() => FilterType, { description: 'Filter used to find fields to update' })
    filter!: Filter<T>;

    @Type(() => UpdateType)
    @ValidateNested()
    @Field(() => UpdateType, { description: 'The update to apply to all records found using the filter' })
    input!: U;
  }

  return UpdateManyArgs;
}
