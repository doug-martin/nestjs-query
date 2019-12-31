import { IsBoolean } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Class, FilterFieldComparison } from '@nestjs-query/core';
import { IsUndefined } from '../../validators';

let booleanFieldComparison: Class<FilterFieldComparison<boolean>>;

export function getOrCreateBooleanFieldComparison(): Class<FilterFieldComparison<boolean>> {
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
