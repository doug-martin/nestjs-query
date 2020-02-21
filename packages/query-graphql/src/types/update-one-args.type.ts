import { DeepPartial, Class } from '@nestjs-query/core';
import { Field, ID, ArgsType } from 'type-graphql';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export interface UpdateOneArgsType<DTO, U extends DeepPartial<DTO>> {
  id: string | number;
  input: U;
}

export function UpdateOneArgsType<T, U extends DeepPartial<T>>(UpdateType: Class<U>): Class<UpdateOneArgsType<T, U>> {
  @ArgsType()
  class UpdateOneArgs implements UpdateOneArgsType<T, U> {
    @IsNotEmpty()
    @Field(() => ID, { description: 'The id of the record to update' })
    id!: string | number;

    @Type(() => UpdateType)
    @ValidateNested()
    @Field(() => UpdateType, { description: 'The update to apply.' })
    input!: U;
  }
  return UpdateOneArgs;
}
