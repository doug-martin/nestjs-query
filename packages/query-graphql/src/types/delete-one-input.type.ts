import { Class } from '@nestjs-query/core';
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

export interface DeleteOneInputType {
  id: string | number;
}

/** @internal */
let deleteOneInputType: Class<DeleteOneInputType> | null = null;

/**
 * The input type for delete one endpoints.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function DeleteOneInputType(): Class<DeleteOneInputType> {
  if (deleteOneInputType) {
    return deleteOneInputType;
  }
  @InputType()
  class DeleteOneInput implements DeleteOneInputType {
    @IsNotEmpty()
    @Field(() => ID, { description: 'The id of the record to delete.' })
    id!: string | number;
  }
  deleteOneInputType = DeleteOneInput;
  return deleteOneInputType;
}
