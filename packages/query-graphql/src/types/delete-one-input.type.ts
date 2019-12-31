import { Class, DeleteOne } from '@nestjs-query/core';
import { Field, ID, InputType } from 'type-graphql';

export function DeleteOneInputType(): Class<DeleteOne> {
  @InputType({ isAbstract: true })
  class DeleteOneImpl implements DeleteOne {
    @Field(() => ID)
    id!: string | number;
  }
  return DeleteOneImpl;
}
