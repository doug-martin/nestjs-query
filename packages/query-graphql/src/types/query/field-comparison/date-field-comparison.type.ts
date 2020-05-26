import { Class, FilterFieldComparison } from '@nestjs-query/core';
import { Field, GraphQLISODateTime, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, ValidateNested } from 'class-validator';
import { IsUndefined } from '../../validators';

/** @internal */
let dateFieldComparison: Class<FilterFieldComparison<Date>>;

/** @internal */
export function getOrCreateDateFieldComparison(): Class<FilterFieldComparison<Date>> {
  if (dateFieldComparison) {
    return dateFieldComparison;
  }

  @InputType()
  class DateFieldComparisonBetween {
    @Field(() => GraphQLISODateTime, { nullable: false })
    @IsDate()
    lower!: Date;

    @Field(() => GraphQLISODateTime, { nullable: false })
    @IsDate()
    upper!: Date;
  }

  @InputType('DateFieldComparison')
  class DateFieldComparison implements FilterFieldComparison<Date> {
    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    is?: boolean | null;

    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    isNot?: boolean | null;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @IsUndefined()
    @IsDate()
    eq?: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @IsUndefined()
    @IsDate()
    neq?: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @IsUndefined()
    @IsDate()
    gt?: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @IsUndefined()
    @IsDate()
    gte?: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @IsUndefined()
    @IsDate()
    lt?: Date;

    @Field(() => GraphQLISODateTime, { nullable: true })
    @IsUndefined()
    @IsDate()
    lte?: Date;

    @Field(() => [GraphQLISODateTime], { nullable: true })
    @IsUndefined()
    @IsDate({ each: true })
    in?: Date[];

    @Field(() => [GraphQLISODateTime], { nullable: true })
    @IsUndefined()
    @IsDate({ each: true })
    notIn?: Date[];

    @Field(() => DateFieldComparisonBetween, { nullable: true })
    @ValidateNested()
    @Type(() => DateFieldComparisonBetween)
    between?: DateFieldComparisonBetween;

    @Field(() => DateFieldComparisonBetween, { nullable: true })
    @ValidateNested()
    @Type(() => DateFieldComparisonBetween)
    notBetween?: DateFieldComparisonBetween;
  }
  dateFieldComparison = DateFieldComparison;
  return dateFieldComparison;
}
