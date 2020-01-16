import { Class, FilterFieldComparison } from '@nestjs-query/core';
import { Field, GraphQLISODateTime, InputType } from 'type-graphql';
import { IsBoolean, IsDate } from 'class-validator';
import { IsUndefined } from '../../validators';

let dateFieldComparison: Class<FilterFieldComparison<Date>>;

export function getOrCreateDateFieldComparison(): Class<FilterFieldComparison<Date>> {
  if (dateFieldComparison) {
    return dateFieldComparison;
  }
  @InputType('DateFieldComparison')
  class DateFieldComparison implements FilterFieldComparison<Date> {
    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsUndefined()
    is?: boolean | null;

    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsUndefined()
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
  }
  dateFieldComparison = DateFieldComparison;
  return dateFieldComparison;
}
