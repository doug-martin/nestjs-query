import { FilterFieldComparison } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { Field, Float, InputType } from 'type-graphql';
import { IsBoolean, IsNumber } from 'class-validator';
import { IsUndefined } from '../../validators';

let floatFieldComparison: Type<FilterFieldComparison<number>>;

export function getOrCreateFloatFieldComparison(): Type<FilterFieldComparison<number>> {
  if (!floatFieldComparison) {
    @InputType()
    class FloatFieldComparison implements FilterFieldComparison<number> {
      @Field(() => Boolean, { nullable: true })
      @IsBoolean()
      @IsUndefined()
      is?: boolean | null;

      @Field(() => Boolean, { nullable: true })
      @IsBoolean()
      @IsUndefined()
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
    }

    floatFieldComparison = FloatFieldComparison;
  }
  return floatFieldComparison;
}
