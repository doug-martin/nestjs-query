import { Class, FilterFieldComparison } from '@nestjs-query/core';
import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsString, IsOptional } from 'class-validator';
import { IsUndefined } from '../../validators';

/** @internal */
let stringFieldComparison: Class<FilterFieldComparison<string>>;

/** @internal */
export function getOrCreateStringFieldComparison(): Class<FilterFieldComparison<string>> {
  if (stringFieldComparison) {
    return stringFieldComparison;
  }
  @InputType()
  class StringFieldComparison implements FilterFieldComparison<string> {
    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    is?: boolean | null;

    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    isNot?: boolean | null;

    @Field({ nullable: true })
    @IsString()
    @IsUndefined()
    eq?: string;

    @Field({ nullable: true })
    @IsString()
    @IsUndefined()
    neq?: string;

    @Field({ nullable: true })
    @IsString()
    @IsUndefined()
    gt?: string;

    @Field({ nullable: true })
    @IsString()
    @IsUndefined()
    gte?: string;

    @Field({ nullable: true })
    @IsString()
    @IsUndefined()
    lt?: string;

    @Field({ nullable: true })
    @IsString()
    @IsUndefined()
    lte?: string;

    @Field({ nullable: true })
    @IsString()
    @IsUndefined()
    like?: string;

    @Field({ nullable: true })
    @IsString()
    @IsUndefined()
    notLike?: string;

    @Field({ nullable: true })
    @IsString()
    @IsUndefined()
    iLike?: string;

    @Field({ nullable: true })
    @IsString()
    @IsUndefined()
    notILike?: string;

    @Field(() => [String], { nullable: true })
    @IsUndefined()
    @IsString({ each: true })
    in?: string[];

    @Field(() => [String], { nullable: true })
    @IsUndefined()
    @IsString({ each: true })
    notIn?: string[];
  }
  stringFieldComparison = StringFieldComparison;
  return stringFieldComparison;
}
