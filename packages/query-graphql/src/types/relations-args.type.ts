import { Class } from '@nestjs-query/core';
import { Field, ArgsType, ID } from 'type-graphql';
import { IsNotEmpty } from 'class-validator';

export interface RelationsArgsType {
  id: string | number;
  relationIds: (string | number)[];
}

/** @internal */
let relationsArgsType: Class<RelationsArgsType> | null = null;
export function RelationsArgsType(): Class<RelationsArgsType> {
  if (relationsArgsType) {
    return relationsArgsType;
  }
  @ArgsType()
  class RelationsArgs implements RelationsArgsType {
    @Field(() => ID, { description: 'The id of the record.' })
    @IsNotEmpty()
    id!: string | number;

    @Field(() => [ID], { description: 'The ids of the relations.' })
    @IsNotEmpty()
    relationIds!: (string | number)[];
  }
  relationsArgsType = RelationsArgs;
  return relationsArgsType;
}
