import 'reflect-metadata';
import { Filter, DeleteMany } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { Field, InputType } from 'type-graphql';

export function GraphQLDeleteManyInput<T, F extends Filter<T>>(FilterType: Type<F>): Type<DeleteMany<T>> {
  @InputType({ isAbstract: true })
  class DeleteManyImpl implements DeleteMany<T> {
    @Field(() => FilterType)
    filter: Filter<T>;
  }
  return DeleteManyImpl;
}
