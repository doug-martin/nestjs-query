import { UpdateOne, DeepPartial } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { Field, ID, InputType } from 'type-graphql';

export function GraphQLUpdateOneInput<T, U extends DeepPartial<T>>(UpdateType: Type<U>): Type<UpdateOne<T, U>> {
  @InputType({ isAbstract: true })
  class UpdateOneImp implements UpdateOne<T, U> {
    @Field(() => ID)
    id!: string | number;

    @Field(() => UpdateType)
    update!: U;
  }
  return UpdateOneImp;
}
