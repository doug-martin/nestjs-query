import { UpdateMany, DeepPartial, Filter, Class } from '@nestjs-query/core';
import { Field, InputType } from 'type-graphql';

export function UpdateManyInputType<T, U extends DeepPartial<T>, F extends Filter<T>>(
  FilterType: Class<F>,
  UpdateType: Class<U>,
): Class<UpdateMany<T, U>> {
  @InputType({ isAbstract: true })
  class UpdateManyImpl implements UpdateMany<T, U> {
    @Field(() => FilterType)
    filter!: Filter<T>;

    @Field(() => UpdateType)
    update!: U;
  }
  return UpdateManyImpl;
}
