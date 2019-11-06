import { FilterFieldComparison } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { IsBoolean } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { ReturnTypeFunc } from '../../../external/type-graphql.types';
import { IsUndefined } from '../../validators';
import { getOrCreateFloatFieldComparison } from './float-field-comparison.type';
import { getOrCreateIntFieldComparison } from './int-field-comparison.type';
import { getOrCreateStringFieldComparison } from './string-field-comparison.type';
import { getOrCreateBooleanFieldComparison } from './boolean-field-comparison.type';
import { getOrCreateNumberFieldComparison } from './number-field-comparison.type';
import { getOrCreateDateFieldComparison } from './date-field-comparision.type';
import { getOrCreateTimestampFieldComparison } from './timestamp-field-comparison.type';

const filterComparisonMap = new Map<string, () => Type<FilterFieldComparison<unknown>>>();
filterComparisonMap.set('StringFilterComparison', getOrCreateStringFieldComparison);
filterComparisonMap.set('NumberFilterComparison', getOrCreateNumberFieldComparison);
filterComparisonMap.set('IntFilterComparison', getOrCreateIntFieldComparison);
filterComparisonMap.set('FloatFilterComparison', getOrCreateFloatFieldComparison);
filterComparisonMap.set('BooleanFilterComparison', getOrCreateBooleanFieldComparison);
filterComparisonMap.set('DateFilterComparison', getOrCreateDateFieldComparison);
filterComparisonMap.set('DateTimeFilterComparison', getOrCreateDateFieldComparison);
filterComparisonMap.set('TimestampFilterComparison', getOrCreateTimestampFieldComparison);

const createPrefixFromClass = <T>(TClass: Type<T>): string => {
  const clsName = TClass.name;
  return `${clsName.charAt(0).toUpperCase()}${clsName.slice(1)}`;
};

export const createFilterComparisonType = <T>(
  TClass: Type<T>,
  returnTypeFunc?: ReturnTypeFunc,
): Type<FilterFieldComparison<T>> => {
  const fieldType = returnTypeFunc ? (returnTypeFunc() as Type<unknown>) : TClass;
  const inputName = `${createPrefixFromClass(fieldType)}FilterComparison`;
  const generator = filterComparisonMap.get(inputName);
  if (generator) {
    return generator() as Type<FilterFieldComparison<T>>;
  }

  @InputType(inputName)
  class Fc {
    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsUndefined()
    is?: boolean | null;

    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsUndefined()
    isNot?: boolean | null;

    @Field(() => fieldType, { nullable: true })
    eq?: T;

    @Field(() => fieldType, { nullable: true })
    neq?: T;

    @Field(() => fieldType, { nullable: true })
    gt?: T;

    @Field(() => fieldType, { nullable: true })
    gte?: T;

    @Field(() => fieldType, { nullable: true })
    lt?: T;

    @Field(() => fieldType, { nullable: true })
    lte?: T;

    @Field(() => fieldType, { nullable: true })
    like?: T;

    @Field(() => fieldType, { nullable: true })
    notLike?: T;

    @Field(() => fieldType, { nullable: true })
    iLike?: T;

    @Field(() => fieldType, { nullable: true })
    notILike?: T;

    @Field(() => fieldType, { nullable: true })
    in?: T[];

    @Field(() => fieldType, { nullable: true })
    notIn?: T[];
  }

  filterComparisonMap.set(inputName, () => Fc);
  return Fc as Type<FilterFieldComparison<T>>;
};
