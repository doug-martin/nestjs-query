import { FilterFieldComparison } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { Field, GraphQLISODateTime, InputType } from 'type-graphql';
import { IsBoolean, IsDate } from 'class-validator';
import { IsUndefined } from '../../validators';

let dateFieldComparison: Type<FilterFieldComparison<Date>>;

export function getOrCreateDateFieldComparison(): Type<FilterFieldComparison<Date>> {
  if (!dateFieldComparison) {
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
  }
  return dateFieldComparison;
}
