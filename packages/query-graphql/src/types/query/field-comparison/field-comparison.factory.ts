import {
  Field,
  Float,
  GraphQLISODateTime,
  GraphQLTimestamp,
  ID,
  InputType,
  Int,
  ReturnTypeFunc,
  ReturnTypeFuncValue
} from '@nestjs/graphql'
import { Class, FilterComparisonOperators, FilterFieldComparison, isNamed } from '@ptc-org/nestjs-query-core'
import { Type } from 'class-transformer'
import { IsBoolean, IsDate, IsOptional, ValidateNested } from 'class-validator'
import { upperCaseFirst } from 'upper-case-first'

import { getGraphqlEnumMetadata } from '../../../common'
import { SkipIf } from '../../../decorators'
import { IsUndefined } from '../../validators'
import { isInAllowedList } from '../helpers'
import { getOrCreateBooleanFieldComparison } from './boolean-field-comparison.type'
import { getOrCreateDateFieldComparison } from './date-field-comparison.type'
import { getOrCreateFloatFieldComparison } from './float-field-comparison.type'
import { getOrCreateIntFieldComparison } from './int-field-comparison.type'
import { getOrCreateNumberFieldComparison } from './number-field-comparison.type'
import { getOrCreateStringFieldComparison } from './string-field-comparison.type'
import { getOrCreateTimestampFieldComparison } from './timestamp-field-comparison.type'

/** @internal */
const filterComparisonMap = new Map<string, () => Class<FilterFieldComparison<unknown>>>()
filterComparisonMap.set('StringFilterComparison', getOrCreateStringFieldComparison)
filterComparisonMap.set('NumberFilterComparison', getOrCreateNumberFieldComparison)
filterComparisonMap.set('IntFilterComparison', getOrCreateIntFieldComparison)
filterComparisonMap.set('FloatFilterComparison', getOrCreateFloatFieldComparison)
filterComparisonMap.set('BooleanFilterComparison', getOrCreateBooleanFieldComparison)
filterComparisonMap.set('DateFilterComparison', getOrCreateDateFieldComparison)
filterComparisonMap.set('DateTimeFilterComparison', getOrCreateDateFieldComparison)
filterComparisonMap.set('TimestampFilterComparison', getOrCreateTimestampFieldComparison)

const knownTypes: Set<ReturnTypeFuncValue> = new Set([
  String,
  Number,
  Boolean,
  Int,
  Float,
  ID,
  Date,
  GraphQLISODateTime,
  GraphQLTimestamp
])

const allowedBetweenTypes: Set<ReturnTypeFuncValue> = new Set([Number, Int, Float, Date, GraphQLISODateTime, GraphQLTimestamp])

/** @internal */
const getTypeName = (SomeType: ReturnTypeFuncValue): string => {
  if (knownTypes.has(SomeType) || isNamed(SomeType)) {
    const typeName = (SomeType as { name: string }).name
    return upperCaseFirst(typeName)
  }
  if (typeof SomeType === 'object') {
    const enumType = getGraphqlEnumMetadata(SomeType)
    if (enumType) {
      return upperCaseFirst(enumType.name)
    }
  }
  throw new Error(`Unable to create filter comparison for ${JSON.stringify(SomeType)}.`)
}

const isCustomFieldComparison = <T>(options: FilterComparisonOptions<T>): boolean => !!options.allowedComparisons

const getComparisonTypeName = <T>(fieldType: ReturnTypeFuncValue, options: FilterComparisonOptions<T>): string => {
  if (isCustomFieldComparison(options)) {
    return `${upperCaseFirst(options.fieldName)}FilterComparison`
  }
  return `${getTypeName(fieldType)}FilterComparison`
}

type FilterComparisonOptions<T> = {
  FieldType: Class<T>
  fieldName: string
  allowedComparisons?: FilterComparisonOperators<T>[]
  returnTypeFunc?: ReturnTypeFunc
}

/** @internal */
export function createFilterComparisonType<T>(options: FilterComparisonOptions<T>): Class<FilterFieldComparison<T>> {
  const { FieldType, returnTypeFunc } = options
  const fieldType = returnTypeFunc ? returnTypeFunc() : FieldType
  const inputName = getComparisonTypeName(fieldType, options)
  const generator = filterComparisonMap.get(inputName)

  if (generator) {
    return generator() as Class<FilterFieldComparison<T>>
  }

  const isNotAllowed = (val: FilterComparisonOperators<unknown>, mustBeType?: Set<ReturnTypeFuncValue>) => () => {
    const comparisonAllowed = isInAllowedList(options.allowedComparisons, val as unknown)

    if (comparisonAllowed) {
      return mustBeType && !mustBeType.has(fieldType)
    }

    return true
  }

  @InputType(`${inputName}Between`)
  class FcBetween {
    @Field(() => fieldType, { nullable: false })
    @IsDate()
    lower!: T

    @Field(() => fieldType, { nullable: false })
    @IsDate()
    upper!: T
  }

  @InputType(inputName)
  class Fc {
    @SkipIf(isNotAllowed('is'), Field(() => Boolean, { nullable: true }))
    @IsBoolean()
    @IsOptional()
    is?: boolean | null

    @SkipIf(isNotAllowed('isNot'), Field(() => Boolean, { nullable: true }))
    @IsBoolean()
    @IsOptional()
    isNot?: boolean | null

    @SkipIf(isNotAllowed('eq'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    eq?: T

    @SkipIf(isNotAllowed('neq'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    neq?: T

    @SkipIf(isNotAllowed('gt'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    gt?: T

    @SkipIf(isNotAllowed('gte'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    gte?: T

    @SkipIf(isNotAllowed('lt'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    lt?: T

    @SkipIf(isNotAllowed('lte'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    lte?: T

    @SkipIf(isNotAllowed('like'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    like?: T

    @SkipIf(isNotAllowed('notLike'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    notLike?: T

    @SkipIf(isNotAllowed('iLike'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    iLike?: T

    @SkipIf(isNotAllowed('notILike'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    notILike?: T;

    @SkipIf(isNotAllowed('in'), Field(() => [fieldType], { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    in?: T[]

    @SkipIf(isNotAllowed('notIn'), Field(() => [fieldType], { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    notIn?: T[]

    @SkipIf(isNotAllowed('between', allowedBetweenTypes), Field(() => FcBetween, { nullable: true }))
    @ValidateNested()
    @Type(() => FcBetween)
    between?: T

    @SkipIf(isNotAllowed('notBetween', allowedBetweenTypes), Field(() => FcBetween, { nullable: true }))
    @ValidateNested()
    @Type(() => FcBetween)
    notBetween?: T
  }

  filterComparisonMap.set(inputName, () => Fc)
  return Fc as Class<FilterFieldComparison<T>>
}
