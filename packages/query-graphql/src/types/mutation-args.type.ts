import { Class } from '@nestjs-query/core';
import { ArgsType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export interface MutationArgsType<Input> {
  input: Input;
}

export function MutationArgsType<Input>(InputClass: Class<Input>): Class<MutationArgsType<Input>> {
  @ArgsType()
  class MutationArgs implements MutationArgsType<Input> {
    @Type(() => InputClass)
    @ValidateNested()
    @Field(() => InputClass)
    input!: Input;
  }
  return MutationArgs;
}
