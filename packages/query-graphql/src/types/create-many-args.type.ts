import { Class } from '@nestjs-query/core';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ArgsType, Field } from 'type-graphql';

export interface CreateManyArgsType<C> {
  input: C[];
}

export function CreateManyArgsType<C>(ItemClass: Class<C>): Class<CreateManyArgsType<C>> {
  @ArgsType()
  class CreateManyArgs implements CreateManyArgsType<C> {
    @Type(() => ItemClass)
    @ValidateNested({ each: true })
    @Field(() => [ItemClass], { description: 'Array of records to create' })
    input!: C[];
  }
  return CreateManyArgs;
}
