import { Class, DeleteManyResponse } from '@nestjs-query/core';
import { Field, Int, ObjectType } from '@nestjs/graphql';

/** @internal */
let deleteManyResponseType: Class<DeleteManyResponse> | null = null;

export const DeleteManyResponseType = (): Class<DeleteManyResponse> => {
  if (deleteManyResponseType) {
    return deleteManyResponseType;
  }
  @ObjectType('DeleteManyResponse')
  class DeleteManyResponseTypeImpl implements DeleteManyResponse {
    @Field(() => Int, { description: 'The number of records deleted.' })
    deletedCount!: number;
  }
  deleteManyResponseType = DeleteManyResponseTypeImpl;
  return deleteManyResponseType;
};
