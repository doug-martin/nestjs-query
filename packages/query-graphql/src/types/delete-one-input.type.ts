import { Class } from '@nestjs-query/core';
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { getDTOIdTypeOrDefault } from '../common';

export interface DeleteOneInputType {
  id: string | number;
}

/**
 * The input type for delete one endpoints.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function DeleteOneInputType(DTOClass: Class<unknown>): Class<DeleteOneInputType> {
  const IDType = getDTOIdTypeOrDefault([DTOClass]);
  @InputType({ isAbstract: true })
  class DeleteOneInput implements DeleteOneInputType {
    @IsNotEmpty()
    @Field(() => IDType, { description: 'The id of the record to delete.' })
    id!: string | number;
  }
  return DeleteOneInput;
}
