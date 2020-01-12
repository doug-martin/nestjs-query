import { Class, DeleteOne } from '@nestjs-query/core';
import { Field, ID, ArgsType } from 'type-graphql';

export function DeleteOneArgsType(): Class<DeleteOne> {
  @ArgsType()
  class DeleteOneArgs implements DeleteOne {
    @Field(() => ID)
    id!: string | number;
  }
  return DeleteOneArgs;
}
