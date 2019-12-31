import { UpdateOne, DeepPartial, Class } from '@nestjs-query/core';
import { Field, ID, InputType } from 'type-graphql';

export function UpdateOneInputType<T, U extends DeepPartial<T>>(UpdateType: Class<U>): Class<UpdateOne<T, U>> {
  @InputType({ isAbstract: true })
  class UpdateOneImp implements UpdateOne<T, U> {
    @Field(() => ID)
    id!: string | number;

    @Field(() => UpdateType)
    update!: U;
  }
  return UpdateOneImp;
}
