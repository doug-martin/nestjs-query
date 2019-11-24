import { DeleteManyResponse } from '@nestjs-query/core';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class DeleteManyResponseType implements DeleteManyResponse {
  @Field(() => Int)
  deletedCount!: number;
}
