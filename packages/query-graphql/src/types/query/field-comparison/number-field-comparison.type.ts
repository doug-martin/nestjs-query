import { Class, FilterFieldComparison } from '@nestjs-query/core';
import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { IsUndefined } from '../../validators';

/** @internal */
let numberFieldComparison: Class<FilterFieldComparison<number>>;

/** @internal */
export function getOrCreateNumberFieldComparison(): Class<FilterFieldComparison<number>> {
  if (numberFieldComparison) {
    return numberFieldComparison;
  }
  @InputType()
  class NumberFieldComparison implements FilterFieldComparison<number> {
    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    is?: boolean | null;

    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    isNot?: boolean | null;

    @Field({ nullable: true })
    @IsNumber()
    @IsUndefined()
    eq?: number;

    @Field({ nullable: true })
    @IsNumber()
    @IsUndefined()
    neq?: number;

    @Field({ nullable: true })
    @IsNumber()
    @IsUndefined()
    gt?: number;

    @Field({ nullable: true })
    @IsNumber()
    @IsUndefined()
    gte?: number;

    @Field({ nullable: true })
    @IsNumber()
    @IsUndefined()
    lt?: number;

    @Field({ nullable: true })
    @IsNumber()
    @IsUndefined()
    lte?: number;

    @Field(() => [Number], { nullable: true })
    @IsNumber({}, { each: true })
    @IsUndefined()
    in?: number[];

    @Field(() => [Number], { nullable: true })
    @IsNumber({}, { each: true })
    @IsUndefined()
    notIn?: number[];
  }
  numberFieldComparison = NumberFieldComparison;
  return numberFieldComparison;
}
