import { Class } from '@nestjs-query/core';
import { Field, ArgsType, ID } from 'type-graphql';
import { IsNotEmpty } from 'class-validator';

export interface RelationArgsType {
  id: string | number;
  relationId: string | number;
}

/** @internal */
let relationsArgsType: Class<RelationArgsType> | null = null;
export function RelationArgsType(): Class<RelationArgsType> {
  if (relationsArgsType) {
    return relationsArgsType;
  }
  @ArgsType()
  class RelationArgs implements RelationArgsType {
    @Field(() => ID, { description: 'The id of the record.' })
    @IsNotEmpty()
    id!: string | number;

    @Field(() => ID, { description: 'The id of relation.' })
    @IsNotEmpty()
    relationId!: string | number;
  }
  relationsArgsType = RelationArgs;
  return relationsArgsType;
}
