import { Class, UpdateManyResponse } from '@nestjs-query/core';
import { Field, Int, ObjectType } from 'type-graphql';

let updateManyResponseType: Class<UpdateManyResponse> | null = null;
export const UpdateManyResponseType = (): Class<UpdateManyResponse> => {
  if (!updateManyResponseType) {
    @ObjectType('UpdateManyResponseType')
    class UpdateManyResponseTypeImpl implements UpdateManyResponse {
      @Field(() => Int)
      updatedCount!: number;
    }

    updateManyResponseType = UpdateManyResponseTypeImpl;
  }
  return updateManyResponseType;
};
