import { Class } from '@nestjs-query/core';
import { ArgsType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export interface SubscriptionArgsType<Input> {
  input?: Input;
}
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function SubscriptionArgsType<Input>(InputClass: Class<Input>): Class<SubscriptionArgsType<Input>> {
  @ArgsType()
  class SubscriptionArgs implements SubscriptionArgsType<Input> {
    @Type(() => InputClass)
    @ValidateNested()
    @Field(() => InputClass, { nullable: true })
    input?: Input;
  }
  return SubscriptionArgs;
}
