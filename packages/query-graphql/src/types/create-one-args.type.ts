import { Class } from '@nestjs-query/core';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ArgsType, Field } from 'type-graphql';

export interface CreateOneArgsType<C> {
  input: C;
}

export function CreateOneArgsType<C>(ItemClass: Class<C>): Class<CreateOneArgsType<C>> {
  @ArgsType()
  class CreateOneArgs implements CreateOneArgsType<C> {
    @Type(() => ItemClass)
    @ValidateNested()
    @Field(() => ItemClass, { description: 'The record to create' })
    input!: C;
  }
  return CreateOneArgs;
}
