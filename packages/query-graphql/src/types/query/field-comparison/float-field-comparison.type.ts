import { Class, FilterFieldComparison } from '@nestjs-query/core';
import { Field, Float, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsUndefined } from '../../validators';

/** @internal */
let floatFieldComparison: Class<FilterFieldComparison<number>>;

/** @internal */
export function getOrCreateFloatFieldComparison(): Class<FilterFieldComparison<number>> {
  if (floatFieldComparison) {
    return floatFieldComparison;
  }

  @InputType()
  class FloatFieldComparisonBetween {
    @Field(() => Float, { nullable: false })
    @IsNumber()
    lower!: number;

    @Field(() => Float, { nullable: false })
    @IsNumber()
    upper!: number;
  }

  @InputType()
  class FloatFieldComparison implements FilterFieldComparison<number> {
    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    is?: boolean | null;

    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    isNot?: boolean | null;

    @Field(() => Float, { nullable: true })
    @IsNumber()
    @IsUndefined()
    eq?: number;

    @Field(() => Float, { nullable: true })
    @IsNumber()
    @IsUndefined()
    neq?: number;

    @Field(() => Float, { nullable: true })
    @IsNumber()
    @IsUndefined()
    gt?: number;

    @Field(() => Float, { nullable: true })
    @IsNumber()
    @IsUndefined()
    gte?: number;

    @Field(() => Float, { nullable: true })
    @IsNumber()
    @IsUndefined()
    lt?: number;

    @Field(() => Float, { nullable: true })
    @IsNumber()
    @IsUndefined()
    lte?: number;

    @Field(() => [Float], { nullable: true })
    @IsNumber({}, { each: true })
    @IsUndefined()
    in?: number[];

    @Field(() => [Float], { nullable: true })
    @IsNumber({}, { each: true })
    @IsUndefined()
    notIn?: number[];

    @Field(() => FloatFieldComparisonBetween, { nullable: true })
    @ValidateNested()
    @Type(() => FloatFieldComparisonBetween)
    between?: FloatFieldComparisonBetween;

    @Field(() => FloatFieldComparisonBetween, { nullable: true })
    @ValidateNested()
    @Type(() => FloatFieldComparisonBetween)
    notBetween?: FloatFieldComparisonBetween;
  }

  floatFieldComparison = FloatFieldComparison;
  return floatFieldComparison;
}
