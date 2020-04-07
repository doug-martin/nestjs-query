import { Class } from '@nestjs-query/core';
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export interface UpdateOneInputType<U> {
  id: string | number;
  update: U;
}

/**
 * The abstract input type for update one endpoints.
 * @param UpdateType - The InputType to use for the update field.
 */
export function UpdateOneInputType<U>(UpdateType: Class<U>): Class<UpdateOneInputType<U>> {
  @InputType({ isAbstract: true })
  class UpdateOneInput implements UpdateOneInputType<U> {
    @IsNotEmpty()
    @Field(() => ID, { description: 'The id of the record to update' })
    id!: string | number;

    @Type(() => UpdateType)
    @ValidateNested()
    @Field(() => UpdateType, { description: 'The update to apply.' })
    update!: U;
  }
  return UpdateOneInput;
}
