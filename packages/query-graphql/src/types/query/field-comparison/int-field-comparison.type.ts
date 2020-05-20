import { Class, FilterFieldComparison } from '@nestjs-query/core';
import { Field, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { IsUndefined } from '../../validators';

/** @internal */
let intFieldComparison: Class<FilterFieldComparison<number>>;

/** @internal */
export function getOrCreateIntFieldComparison(): Class<FilterFieldComparison<number>> {
  if (intFieldComparison) {
    return intFieldComparison;
  }

  @InputType()
  class IntFieldComparisonBetween {
    @Field(() => Int, { nullable: false })
    @IsInt()
    lower!: number;

    @Field(() => Int, { nullable: false })
    @IsInt()
    upper!: number;
  }

  @InputType()
  class IntFieldComparison implements FilterFieldComparison<number> {
    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    is?: boolean | null;

    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
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

    @Field(() => IntFieldComparisonBetween, { nullable: true })
    @ValidateNested()
    @Type(() => IntFieldComparisonBetween)
    between?: IntFieldComparisonBetween;

    @Field(() => IntFieldComparisonBetween, { nullable: true })
    @ValidateNested()
    @Type(() => IntFieldComparisonBetween)
    notBetween?: IntFieldComparisonBetween;
  }
  intFieldComparison = IntFieldComparison;
  return intFieldComparison;
}
