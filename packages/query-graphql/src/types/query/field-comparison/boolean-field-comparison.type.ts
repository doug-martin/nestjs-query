import { IsBoolean } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Class, FilterFieldComparison } from '@nestjs-query/core';
import { IsUndefined } from '../../validators';

/** @internal */
let booleanFieldComparison: Class<FilterFieldComparison<boolean>>;

/** @internal */
export function getOrCreateBooleanFieldComparison(): Class<FilterFieldComparison<boolean>> {
  if (booleanFieldComparison) {
    return booleanFieldComparison;
  }
  @InputType()
  class BooleanFieldComparison implements FilterFieldComparison<boolean> {
    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsUndefined()
    is?: boolean | null;

    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsUndefined()
    isNot?: boolean | null;
  }
  booleanFieldComparison = BooleanFieldComparison;
  return BooleanFieldComparison;
}
