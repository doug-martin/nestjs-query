import { Class, FilterFieldComparison } from '@nestjs-query/core';
import { Field, InputType } from 'type-graphql';
import { IsBoolean, IsString } from 'class-validator';
import { IsUndefined } from '../../validators';

let stringFieldComparison: Class<FilterFieldComparison<string>>;

export function getOrCreateStringFieldComparison(): Class<FilterFieldComparison<string>> {
  if (!stringFieldComparison) {
    @InputType()
    class StringFieldComparison implements FilterFieldComparison<string> {
      @Field(() => Boolean, { nullable: true })
      @IsBoolean()
      @IsUndefined()
      is?: boolean | null;

      @Field(() => Boolean, { nullable: true })
      @IsBoolean()
      @IsUndefined()
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
  }
  return stringFieldComparison;
}
