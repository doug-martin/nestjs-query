import { DeepPartial, Filter, Class } from '@nestjs-query/core';
import { Field, ArgsType } from 'type-graphql';

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
    @Field(() => FilterType)
    filter!: Filter<T>;

    @Field(() => UpdateType)
    input!: U;
  }

  return UpdateManyArgs;
}
