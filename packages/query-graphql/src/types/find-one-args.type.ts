import { Class } from '@nestjs-query/core';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { getDTOIdTypeOrDefault } from '../common';

export interface FindOneArgsType {
  id: string | number;
}
/**
 * The input type for delete one endpoints.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function FindOneArgsType(DTOClass: Class<unknown>): Class<FindOneArgsType> {
  const IDType = getDTOIdTypeOrDefault([DTOClass]);
  @ArgsType()
  class FindOneArgs implements FindOneArgsType {
    @IsNotEmpty()
    @Field(() => IDType, { description: 'The id of the record to find.' })
    id!: string | number;
  }
  return FindOneArgs;
}
