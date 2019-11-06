import { IsBoolean } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Type } from '@nestjs/common';
import { FilterFieldComparison } from '@nestjs-query/core';
import { IsUndefined } from '../../validators';

let booleanFieldComparison: Type<FilterFieldComparison<boolean>>;

export function getOrCreateBooleanFieldComparison(): Type<FilterFieldComparison<boolean>> {
  if (!booleanFieldComparison) {
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
  }
  return booleanFieldComparison;
}
