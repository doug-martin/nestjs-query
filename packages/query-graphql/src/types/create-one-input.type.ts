import { Class, CreateOne, DeepPartial } from '@nestjs-query/core';
import { Field, InputType } from 'type-graphql';

export function CreateOneInputType<T, C extends DeepPartial<T>>(ITemClass: Class<C>): Class<CreateOne<T, C>> {
  @InputType({ isAbstract: true })
  class CreateOneImpl implements CreateOne<T, C> {
    @Field(() => ITemClass)
    item!: C;
  }
  return CreateOneImpl;
}
