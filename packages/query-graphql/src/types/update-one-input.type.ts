import { Class } from '@nestjs-query/core';
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { getDTOIdTypeOrDefault } from '../common';

export interface UpdateOneInputType<U> {
  id: string | number;
  update: U;
}

/**
 * The abstract input type for update one endpoints.
 * @param DTOClass - The base DTO class the UpdateType is based on.
 * @param UpdateType - The InputType to use for the update field.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function UpdateOneInputType<DTO, U>(DTOClass: Class<DTO>, UpdateType: Class<U>): Class<UpdateOneInputType<U>> {
  const IDType = getDTOIdTypeOrDefault([DTOClass, UpdateType]);
  @InputType({ isAbstract: true })
  class UpdateOneInput implements UpdateOneInputType<U> {
    @IsNotEmpty()
    @Field(() => IDType, { description: 'The id of the record to update' })
    id!: string | number;

    @Type(() => UpdateType)
    @ValidateNested()
    @Field(() => UpdateType, { description: 'The update to apply.' })
    update!: U;
  }
  return UpdateOneInput;
}
