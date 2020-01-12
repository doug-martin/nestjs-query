import { DeepPartial, Class } from '@nestjs-query/core';
import { Field, ID, ArgsType } from 'type-graphql';

export interface UpdateOneArgsType<DTO, U extends DeepPartial<DTO>> {
  id: string | number;
  input: U;
}

export function UpdateOneArgsType<T, U extends DeepPartial<T>>(UpdateType: Class<U>): Class<UpdateOneArgsType<T, U>> {
  @ArgsType()
  class UpdateOneArgs implements UpdateOneArgsType<T, U> {
    @Field(() => ID)
    id!: string | number;

    @Field(() => UpdateType)
    input!: U;
  }
  return UpdateOneArgs;
}
