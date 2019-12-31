import { Class, CreateMany, DeepPartial } from '@nestjs-query/core';
import { Field, InputType } from 'type-graphql';

export function CreateManyInputType<T, C extends DeepPartial<T>>(ITemClass: Class<C>): Class<CreateMany<T, C>> {
  @InputType({ isAbstract: true })
  class CreateManyImpl implements CreateMany<T, C> {
    @Field(() => [ITemClass])
    items!: C[];
  }
  return CreateManyImpl;
}
