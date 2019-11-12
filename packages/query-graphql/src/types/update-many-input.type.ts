import { UpdateMany, DeepPartial, Filter } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { Field, InputType } from 'type-graphql';

export function GraphQLUpdateManyInput<T, U extends DeepPartial<T>, F extends Filter<T>>(
  FilterType: Type<F>,
  UpdateType: Type<U>,
): Type<UpdateMany<T, U>> {
  @InputType({ isAbstract: true })
  class UpdateManyImpl implements UpdateMany<T, U> {
    @Field(() => FilterType)
    filter: Filter<T>;

    @Field(() => UpdateType)
    update: U;
  }
  return UpdateManyImpl;
}
