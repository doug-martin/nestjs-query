import 'reflect-metadata';
import { DeleteOne } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { Field, ID, InputType } from 'type-graphql';

export function GraphQLDeleteOneInput(): Type<DeleteOne> {
  @InputType({ isAbstract: true })
  class DeleteOneImpl implements DeleteOne {
    @Field(() => ID)
    id: string | number;
  }
  return DeleteOneImpl;
}
