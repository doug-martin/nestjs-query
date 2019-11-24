import { CreateOne, DeepPartial } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { Field, InputType } from 'type-graphql';

export function GraphQLCreateOneInput<T, C extends DeepPartial<T>>(ITemClass: Type<C>): Type<CreateOne<T, C>> {
  @InputType({ isAbstract: true })
  class CreateOneImpl implements CreateOne<T, C> {
    @Field(() => ITemClass)
    item!: C;
  }
  return CreateOneImpl;
}
