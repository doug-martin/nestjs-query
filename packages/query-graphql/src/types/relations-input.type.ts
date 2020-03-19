import { Class } from '@nestjs-query/core';
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export interface RelationsInputType {
  id: string | number;
  relationIds: (string | number)[];
}

/** @internal */
let relationsInputType: Class<RelationsInputType> | null = null;
export function RelationsInputType(): Class<RelationsInputType> {
  if (relationsInputType) {
    return relationsInputType;
  }
  @InputType()
  class RelationsInput implements RelationsInputType {
    @Field(() => ID, { description: 'The id of the record.' })
    @IsNotEmpty()
    id!: string | number;

    @Field(() => [ID], { description: 'The ids of the relations.' })
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsNotEmpty({ each: true })
    relationIds!: (string | number)[];
  }
  relationsInputType = RelationsInput;
  return relationsInputType;
}
