import { Class, FilterFieldComparison } from '@nestjs-query/core';
import { Field, InputType, Int } from 'type-graphql';
import { IsBoolean, IsInt } from 'class-validator';
import { IsUndefined } from '../../validators';

let intFieldComparison: Class<FilterFieldComparison<number>>;

export function getOrCreateIntFieldComparison(): Class<FilterFieldComparison<number>> {
  if (intFieldComparison) {
    return intFieldComparison;
  }
  @InputType()
  class IntFieldComparison implements FilterFieldComparison<number> {
    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsUndefined()
    is?: boolean | null;

    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsUndefined()
    isNot?: boolean | null;

    @Field(() => Int, { nullable: true })
    @IsInt()
    @IsUndefined()
    eq?: number;

    @Field(() => Int, { nullable: true })
    @IsInt()
    @IsUndefined()
    neq?: number;

    @Field(() => Int, { nullable: true })
    @IsInt()
    @IsUndefined()
    gt?: number;

    @Field(() => Int, { nullable: true })
    @IsInt()
    @IsUndefined()
    gte?: number;

    @Field(() => Int, { nullable: true })
    @IsInt()
    @IsUndefined()
    lt?: number;

    @Field(() => Int, { nullable: true })
    @IsInt()
    @IsUndefined()
    lte?: number;

    @Field(() => [Int], { nullable: true })
    @IsInt({ each: true })
    @IsUndefined()
    in?: number[];

    @Field(() => [Int], { nullable: true })
    @IsInt({ each: true })
    @IsUndefined()
    notIn?: number[];
  }
  intFieldComparison = IntFieldComparison;
  return intFieldComparison;
}
