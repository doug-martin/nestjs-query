import { IsBoolean, IsOptional } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Class, FilterFieldComparison } from '@nestjs-query/core';

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
    @IsOptional()
    is?: boolean | null;

    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    isNot?: boolean | null;
  }
  booleanFieldComparison = BooleanFieldComparison;
  return BooleanFieldComparison;
}
