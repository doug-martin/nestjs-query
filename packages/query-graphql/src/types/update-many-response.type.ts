import { UpdateManyResponse } from '@nestjs-query/core';
import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class UpdateManyResponseType implements UpdateManyResponse {
  @Field(() => Int)
  updatedCount!: number;
}
