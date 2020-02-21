import { Class } from '@nestjs-query/core';
import { Field, ID, ArgsType } from 'type-graphql';

export interface DeleteOneArgsType {
  id: string | number;
}

/** @internal */
let deleteOneArgsType: Class<DeleteOneArgsType> | null = null;
export function DeleteOneArgsType(): Class<DeleteOneArgsType> {
  if (deleteOneArgsType) {
    return deleteOneArgsType;
  }
  @ArgsType()
  class DeleteOneArgs implements DeleteOneArgsType {
    @Field(() => ID, { description: 'The id of the record to delete.' })
    id!: string | number;
  }
  deleteOneArgsType = DeleteOneArgs;
  return deleteOneArgsType;
}
