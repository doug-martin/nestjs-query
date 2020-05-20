import { Class, FilterFieldComparison } from '@nestjs-query/core';
import { Field, GraphQLTimestamp, InputType } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsUndefined } from '../../validators';

/** @internal */
let timestampFieldComparison: Class<FilterFieldComparison<Date>>;

/** @internal */
export function getOrCreateTimestampFieldComparison(): Class<FilterFieldComparison<Date>> {
  if (timestampFieldComparison) {
    return timestampFieldComparison;
  }

  @InputType()
  class TimestampFieldComparisonBetween {
    @Field(() => GraphQLTimestamp, { nullable: false })
    @IsDate()
    lower!: Date;

    @Field(() => GraphQLTimestamp, { nullable: false })
    @IsDate()
    upper!: Date;
  }

  @InputType()
  class TimestampFieldComparison implements FilterFieldComparison<Date> {
    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    is?: boolean | null;

    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    isNot?: boolean | null;

    @Field(() => GraphQLTimestamp, { nullable: true })
    @IsUndefined()
    @IsDate()
    eq?: Date;

    @Field(() => GraphQLTimestamp, { nullable: true })
    @IsUndefined()
    @IsDate()
    neq?: Date;

    @Field(() => GraphQLTimestamp, { nullable: true })
    @IsUndefined()
    @IsDate()
    gt?: Date;

    @Field(() => GraphQLTimestamp, { nullable: true })
    @IsUndefined()
    @IsDate()
    gte?: Date;

    @Field(() => GraphQLTimestamp, { nullable: true })
    @IsUndefined()
    @IsDate()
    lt?: Date;

    @Field(() => GraphQLTimestamp, { nullable: true })
    @IsUndefined()
    @IsDate()
    lte?: Date;

    @Field(() => [GraphQLTimestamp], { nullable: true })
    @IsUndefined()
    @IsDate({ each: true })
    in?: Date[];

    @Field(() => [GraphQLTimestamp], { nullable: true })
    @IsUndefined()
    @IsDate({ each: true })
    notIn?: Date[];

    @Field(() => TimestampFieldComparisonBetween, { nullable: true })
    @ValidateNested()
    @Type(() => TimestampFieldComparisonBetween)
    between?: TimestampFieldComparisonBetween;

    @Field(() => TimestampFieldComparisonBetween, { nullable: true })
    @ValidateNested()
    @Type(() => TimestampFieldComparisonBetween)
    notBetween?: TimestampFieldComparisonBetween;
  }

  timestampFieldComparison = TimestampFieldComparison;
  return timestampFieldComparison;
}
