import { Class } from '@nestjs-query/core';
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, ArrayUnique } from 'class-validator';
import { getDTOIdTypeOrDefault } from '../common';

export interface RelationsInputType {
  id: string | number;
  relationIds: (string | number)[];
}

// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function RelationsInputType(DTOClass: Class<unknown>, RelationClass: Class<unknown>): Class<RelationsInputType> {
  const DTOIDType = getDTOIdTypeOrDefault([DTOClass]);
  const RelationIDType = getDTOIdTypeOrDefault([RelationClass]);
  @InputType({ isAbstract: true })
  class RelationsInput implements RelationsInputType {
    @Field(() => DTOIDType, { description: 'The id of the record.' })
    @IsNotEmpty()
    id!: string | number;

    @Field(() => [RelationIDType], { description: 'The ids of the relations.' })
    @ArrayUnique()
    @IsNotEmpty({ each: true })
    relationIds!: (string | number)[];
  }
  return RelationsInput;
}
