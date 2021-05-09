import { Class } from '@nestjs-query/core';
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { getDTOIdTypeOrDefault } from '../common';

export interface RelationInputType {
  id: string | number;
  relationId: string | number;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function RelationInputType(DTOClass: Class<unknown>, RelationClass: Class<unknown>): Class<RelationInputType> {
  const DTOIDType = getDTOIdTypeOrDefault([DTOClass]);
  const RelationIDType = getDTOIdTypeOrDefault([RelationClass]);
  @InputType({ isAbstract: true })
  class RelationInput implements RelationInputType {
    @Field(() => DTOIDType, { description: 'The id of the record.' })
    @IsNotEmpty()
    id!: string | number;

    @Field(() => RelationIDType, { description: 'The id of relation.' })
    @IsNotEmpty()
    relationId!: string | number;
  }
  return RelationInput;
}
