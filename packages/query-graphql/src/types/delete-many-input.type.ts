import { Filter, DeleteMany, Class } from '@nestjs-query/core';
import { Field, InputType } from 'type-graphql';

export function DeleteManyInputType<T, F extends Filter<T>>(FilterType: Class<F>): Class<DeleteMany<T>> {
  @InputType({ isAbstract: true })
  class DeleteManyImpl implements DeleteMany<T> {
    @Field(() => FilterType)
    filter!: Filter<T>;
  }
  return DeleteManyImpl;
}
