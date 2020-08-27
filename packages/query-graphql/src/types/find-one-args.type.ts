import { Class } from '@nestjs-query/core';
import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

export interface FindOneArgsType {
  id: string | number;
}

/** @internal */
let findOneType: Class<FindOneArgsType> | null = null;

/**
 * The input type for delete one endpoints.
 */
export function FindOneArgsType(): Class<FindOneArgsType> {
  if (findOneType) {
    return findOneType;
  }
  @ArgsType()
  class FindOneArgs implements FindOneArgsType {
    @IsNotEmpty()
    @Field(() => ID, { description: 'The id of the record to find.' })
    id!: string | number;
  }
  findOneType = FindOneArgs;
  return findOneType;
}
