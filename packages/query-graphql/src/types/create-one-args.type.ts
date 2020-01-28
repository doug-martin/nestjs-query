import { Class } from '@nestjs-query/core';
import { Field, ArgsType } from 'type-graphql';

export interface CreateOneArgsType<C> {
  input: C;
}

export function CreateOneArgsType<C>(ItemClass: Class<C>): Class<CreateOneArgsType<C>> {
  @ArgsType()
  class CreateOneArgs implements CreateOneArgsType<C> {
    @Field(() => ItemClass, { description: 'The record to create' })
    input!: C;
  }
  return CreateOneArgs;
}
