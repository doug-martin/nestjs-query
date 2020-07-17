import { Class, FilterFieldComparison } from '@nestjs-query/core';
import { IsBoolean, IsOptional } from 'class-validator';
import { upperCaseFirst } from 'upper-case-first';
import {
  Field,
  InputType,
  ReturnTypeFunc,
  ReturnTypeFuncValue,
  Int,
  Float,
  ID,
  GraphQLTimestamp,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { getMetadataStorage } from '../../../metadata';
import { IsUndefined } from '../../validators';
import { getOrCreateFloatFieldComparison } from './float-field-comparison.type';
import { getOrCreateIntFieldComparison } from './int-field-comparison.type';
import { getOrCreateStringFieldComparison } from './string-field-comparison.type';
import { getOrCreateBooleanFieldComparison } from './boolean-field-comparison.type';
import { getOrCreateNumberFieldComparison } from './number-field-comparison.type';
import { getOrCreateDateFieldComparison } from './date-field-comparison.type';
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

const knownTypes: Set<ReturnTypeFuncValue> = new Set([
  String,
  Number,
  Boolean,
  Int,
  Float,
  ID,
  Date,
  GraphQLISODateTime,
  GraphQLTimestamp,
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isNamed = (SomeType: any): SomeType is { name: string } => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return 'name' in SomeType && typeof SomeType.name === 'string';
};

/** @internal */
const getTypeName = <T>(SomeType: ReturnTypeFuncValue): string => {
  if (knownTypes.has(SomeType) || isNamed(SomeType)) {
    const typeName = (SomeType as { name: string }).name;
    return upperCaseFirst(typeName);
  }
  if (typeof SomeType === 'object') {
    const enumType = getMetadataStorage().getGraphqlEnumMetadata(SomeType);
    if (enumType) {
      return upperCaseFirst(enumType.name);
    }
  }
  throw new Error(`Unable to create filter comparison for ${JSON.stringify(SomeType)}.`);
};

/** @internal */
export function createFilterComparisonType<T>(
  TClass: Class<T>,
  returnTypeFunc?: ReturnTypeFunc,
): Class<FilterFieldComparison<T>> {
  const fieldType = returnTypeFunc ? returnTypeFunc() : TClass;
  const inputName = `${getTypeName(fieldType)}FilterComparison`;
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
    @Type(() => TClass)
    eq?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    @Type(() => TClass)
    neq?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    @Type(() => TClass)
    gt?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    @Type(() => TClass)
    gte?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    @Type(() => TClass)
    lt?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    @Type(() => TClass)
    lte?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    @Type(() => TClass)
    like?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    @Type(() => TClass)
    notLike?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    @Type(() => TClass)
    iLike?: T;

    @Field(() => fieldType, { nullable: true })
    @IsUndefined()
    @Type(() => TClass)
    notILike?: T;

    @Field(() => [fieldType], { nullable: true })
    @IsUndefined()
    @Type(() => TClass)
    in?: T[];

    @Field(() => [fieldType], { nullable: true })
    @IsUndefined()
    @Type(() => TClass)
    notIn?: T[];
  }

  filterComparisonMap.set(inputName, () => Fc);
  return Fc as Class<FilterFieldComparison<T>>;
}
