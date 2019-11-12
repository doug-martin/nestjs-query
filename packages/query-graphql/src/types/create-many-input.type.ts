import { CreateMany, DeepPartial } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { Field, InputType } from 'type-graphql';

export function GraphQLCreateManyInput<T, C extends DeepPartial<T>>(ITemClass: Type<C>): Type<CreateMany<T, C>> {
  @InputType({ isAbstract: true })
  class CreateManyImpl implements CreateMany<T, C> {
    @Field(() => [ITemClass])
    items: C[];
  }
  return CreateManyImpl;
}
