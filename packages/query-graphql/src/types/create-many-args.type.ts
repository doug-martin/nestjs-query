import { Class, DeepPartial } from '@nestjs-query/core';
import { Field, ArgsType } from 'type-graphql';

export interface CreateManyArgsType<T, C extends DeepPartial<T>> {
  input: C[];
}

export function CreateManyArgsType<T, C extends DeepPartial<T>>(ITemClass: Class<C>): Class<CreateManyArgsType<T, C>> {
  @ArgsType()
  class CreateManyArgs implements CreateManyArgsType<T, C> {
    @Field(() => [ITemClass])
    input!: C[];
  }
  return CreateManyArgs;
}
