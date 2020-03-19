import { Class, FilterFieldComparison } from '@nestjs-query/core';
import { IsBoolean, IsOptional } from 'class-validator';
import { Field, InputType, ReturnTypeFunc } from '@nestjs/graphql';
import { IsUndefined } from '../../validators';
import { getOrCreateFloatFieldComparison } from './float-field-comparison.type';
import { getOrCreateIntFieldComparison } from './int-field-comparison.type';
import { getOrCreateStringFieldComparison } from './string-field-comparison.type';
import { getOrCreateBooleanFieldComparison } from './boolean-field-comparison.type';
import { getOrCreateNumberFieldComparison } from './number-field-comparison.type';
import { getOrCreateDateFieldComparison } from './date-field-comparision.type';
import { getOrCreateTimestampFieldComparison } from './timestamp-field-comparison.type';

/** @internal */
const filterComparisonMap = new Map<string, () => Class<FilterFieldComparison<unknown>>>();
filterComparisonMap.set('StringFilterComparison', getOrCreateStringFieldComparison);
filterComparisonMap.set('NumberFilterComparison', getOrCreateNumberFieldComparison);
filterComparisonMap.set('IntFilterComparison', getOrCreateIntFieldComparison);
filterComparisonMap.set('FloatFilterComparison', getOrCreateFloatFieldComparison);
filterComparisonMap.set('BooleanFilterComparison', getOrCreateBooleanFieldComparison);
filterComparisonMap.set('DateFilterComparison', getOrCreateDateFieldComparison);
filterComparisonMap.set('DateTimeFilterComparison', getOrCreateDateFieldComparison);
filterComparisonMap.set('TimestampFilterComparison', getOrCreateTimestampFieldComparison);

/** @internal */
const createPrefixFromClass = <T>(TClass: Class<T>): string => {
  const clsName = TClass.name;
  return `${clsName.charAt(0).toUpperCase()}${clsName.slice(1)}`;
};

/** @internal */
export function createFilterComparisonType<T>(
  TClass: Class<T>,
  returnTypeFunc?: ReturnTypeFunc,
): Class<FilterFieldComparison<T>> {
  const fieldType = returnTypeFunc ? (returnTypeFunc() as Class<unknown>) : TClass;
  const inputName = `${createPrefixFromClass(fieldType)}FilterComparison`;
  const generator = filterComparisonMap.get(inputName);
  if (generator) {
    return generator() as Class<FilterFieldComparison<T>>;
  }

  @InputType(inputName)
  class Fc {
    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    is?: boolean | null;

    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    isNot?: boolean | null;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    eq?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    neq?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    gt?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    gte?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    lt?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    lte?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    like?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    notLike?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    iLike?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    notILike?: T;

    @Field(() => [fieldType], { nullable: true })
    @IsUndefined()
    in?: T[];

    @Field(() => [fieldType], { nullable: true })
    @IsUndefined()
    notIn?: T[];
  }

  filterComparisonMap.set(inputName, () => Fc);
  return Fc as Class<FilterFieldComparison<T>>;
}
