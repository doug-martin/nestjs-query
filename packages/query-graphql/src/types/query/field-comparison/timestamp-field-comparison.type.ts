import { Class, FilterFieldComparison } from '@nestjs-query/core';
import { Field, GraphQLTimestamp, InputType } from 'type-graphql';
import { IsBoolean, IsDate } from 'class-validator';
import { IsUndefined } from '../../validators';

let timestampFieldComparison: Class<FilterFieldComparison<Date>>;

export function getOrCreateTimestampFieldComparison(): Class<FilterFieldComparison<Date>> {
  if (!timestampFieldComparison) {
    @InputType()
    class TimestampFieldComparison implements FilterFieldComparison<Date> {
      @Field(() => Boolean, { nullable: true })
      @IsBoolean()
      @IsUndefined()
      is?: boolean | null;

      @Field(() => Boolean, { nullable: true })
      @IsBoolean()
      @IsUndefined()
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
    }

    timestampFieldComparison = TimestampFieldComparison;
  }
  return timestampFieldComparison;
}
