import { Filter, DeleteMany, Class } from '@nestjs-query/core';
import { Field, ArgsType } from 'type-graphql';

export function DeleteManyArgsType<T, F extends Filter<T>>(FilterType: Class<F>): Class<DeleteMany<T>> {
  @ArgsType()
  class DeleteManyArgs implements DeleteMany<T> {
    @Field(() => FilterType)
    filter!: F;
  }
  return DeleteManyArgs;
}
