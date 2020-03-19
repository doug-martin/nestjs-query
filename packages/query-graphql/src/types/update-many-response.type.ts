import { Class, UpdateManyResponse } from '@nestjs-query/core';
import { Field, Int, ObjectType } from '@nestjs/graphql';

/** @internal */
let updateManyResponseType: Class<UpdateManyResponse> | null = null;

export const UpdateManyResponseType = (): Class<UpdateManyResponse> => {
  if (updateManyResponseType) {
    return updateManyResponseType;
  }
  @ObjectType('UpdateManyResponse')
  class UpdateManyResponseTypeImpl implements UpdateManyResponse {
    @Field(() => Int, { description: 'The number of records updated.' })
    updatedCount!: number;
  }
  updateManyResponseType = UpdateManyResponseTypeImpl;
  return updateManyResponseType;
};
