import { Class } from '@nestjs-query/core';
import { Field, ArgsType } from 'type-graphql';

export interface CreateManyArgsType<C> {
  input: C[];
}

export function CreateManyArgsType<C>(ITemClass: Class<C>): Class<CreateManyArgsType<C>> {
  @ArgsType()
  class CreateManyArgs implements CreateManyArgsType<C> {
    @Field(() => [ITemClass], { description: 'Array of records to create' })
    input!: C[];
  }
  return CreateManyArgs;
}
