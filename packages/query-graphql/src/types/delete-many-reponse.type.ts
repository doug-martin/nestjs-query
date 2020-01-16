import { Class, DeleteManyResponse } from '@nestjs-query/core';
import { Field, Int, ObjectType } from 'type-graphql';

let deleteManyResponseType: Class<DeleteManyResponse> | null = null;

export const DeleteManyResponseType = (): Class<DeleteManyResponse> => {
  if (deleteManyResponseType) {
    return deleteManyResponseType;
  }
  @ObjectType('DeleteManyResponseType')
  class DeleteManyResponseTypeImpl implements DeleteManyResponse {
    @Field(() => Int)
    deletedCount!: number;
  }
  deleteManyResponseType = DeleteManyResponseTypeImpl;
  return deleteManyResponseType;
};
