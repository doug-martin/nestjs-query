import { Class, DeepPartial } from '@nestjs-query/core';
import { Field, ArgsType } from 'type-graphql';

export interface CreateOneArgsType<T, C extends DeepPartial<T>> {
  input: C;
}

export function CreateOneArgsType<T, C extends DeepPartial<T> = DeepPartial<T>>(
  ItemClass: Class<C>,
): Class<CreateOneArgsType<T, C>> {
  @ArgsType()
  class CreateOneArgs implements CreateOneArgsType<T, C> {
    @Field(() => ItemClass)
    input!: C;
  }
  return CreateOneArgs;
}
