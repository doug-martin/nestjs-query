import { Class, FilterComparisonOperators, FilterFieldComparison, isNamed } from '@nestjs-query/core';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { upperCaseFirst } from 'upper-case-first';
import {
  Field,
  Float,
  GraphQLISODateTime,
  GraphQLTimestamp,
  ID,
  InputType,
  Int,
  ReturnTypeFunc,
  ReturnTypeFuncValue,
} from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsUndefined } from '../../validators';
import { getOrCreateFloatFieldComparison } from './float-field-comparison.type';
import { getOrCreateIntFieldComparison } from './int-field-comparison.type';
import { getOrCreateStringFieldComparison } from './string-field-comparison.type';
import { getOrCreateBooleanFieldComparison } from './boolean-field-comparison.type';
import { getOrCreateNumberFieldComparison } from './number-field-comparison.type';
import { getOrCreateDateFieldComparison } from './date-field-comparison.type';
import { getOrCreateTimestampFieldComparison } from './timestamp-field-comparison.type';
import { getFilterableFields, SkipIf } from '../../../decorators';
import { getDTONames, getGraphqlEnumMetadata } from '../../../common';
import { isInAllowedList } from '../helpers';
import { FieldComparisonRegistry, FieldComparisonSpec } from './field-comparison.registry';
import { getOrCreateCustomFieldComparison } from './custom-field-comparison.type';

/** @internal */
const filterComparisonMap = new Map<string, () => Class<FilterFieldComparison<unknown> | unknown>>();
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

/** @internal */
export const fieldComparisonRegistry = new FieldComparisonRegistry();

/** @internal */
const getTypeName = (SomeType: ReturnTypeFuncValue): string => {
  if (knownTypes.has(SomeType) || isNamed(SomeType)) {
    const typeName = (SomeType as { name: string }).name;
    return upperCaseFirst(typeName);
  }
  if (typeof SomeType === 'object') {
    const enumType = getGraphqlEnumMetadata(SomeType);
    if (enumType) {
      return upperCaseFirst(enumType.name);
    }
  }
  throw new Error(`Unable to create filter comparison for ${JSON.stringify(SomeType)}.`);
};

const isCustomFieldComparison = <T>(options: FilterComparisonOptions<T>): boolean => !!options.allowedComparisons;

const getComparisonTypeName = <T>(fieldType: ReturnTypeFuncValue, options: FilterComparisonOptions<T>): string => {
  if (isCustomFieldComparison(options)) {
    return `${upperCaseFirst(options.fieldName)}FilterComparison`;
  }
  return `${getTypeName(fieldType)}FilterComparison`;
};

const primitiveTypes = new Set([Number, Date, String, Boolean]);

/**
 * Patches a class prototype to add fields dynamically based on the provided spec
 * @internal
 * */
export function patchFieldComparison(
  fc: Class<unknown>,
  operation: string | symbol,
  spec: FieldComparisonSpec<unknown>,
): void {
  Object.defineProperty(fc, operation, { writable: true, enumerable: true });
  // Only apply validateNested if FilterType is not a primitive type, otherwise class-validator expects an object or array
  if (!primitiveTypes.has(spec.FilterType as never)) {
    ValidateNested()(fc.prototype, operation);
  }
  Field(() => spec.GqlType ?? spec.FilterType, { nullable: true })(fc.prototype, operation);
  Type(() => spec.FilterType)(fc.prototype, operation);
  IsOptional()(fc.prototype, operation);
  for (const dec of spec.decorators ?? []) {
    dec(fc.prototype, operation);
  }
}

export function registerTypeComparison<T>(
  FieldTypeOrTypes: ReturnTypeFuncValue | ReturnTypeFuncValue[],
  operation: string,
  spec: FieldComparisonSpec<T>,
): void {
  const fieldTypes = Array.isArray(FieldTypeOrTypes) ? FieldTypeOrTypes : [FieldTypeOrTypes];
  for (const fieldType of fieldTypes) {
    knownTypes.add(fieldType);
    const inputName = `${getTypeName(fieldType)}FilterComparison`;
    // Register field
    fieldComparisonRegistry.registerTypeOperation(fieldType, operation, spec);
    // Since we are operating on types, it could be that we need to patch the built in comparison operations
    // The following code does exactly that
    if (!filterComparisonMap.has(inputName)) {
      filterComparisonMap.set(inputName, () => getOrCreateCustomFieldComparison(inputName));
    }
    const generator = filterComparisonMap.get(inputName);
    if (!generator) {
      throw new Error(`Cannot register field comparison for unknown type ${inputName}`);
    }
    const fc = generator();
    patchFieldComparison(fc, operation, spec);
  }
}

export function registerDTOFieldComparison<T>(
  DTOClass: Class<T>,
  fieldName: string,
  operation: string,
  spec: FieldComparisonSpec<unknown>,
): void {
  const filterableFields = getFilterableFields(DTOClass);
  const isFieldConcrete = filterableFields.some((v) => v.propertyName === fieldName);
  // TODO Maybe we can relax this constraint, TBD
  if (isFieldConcrete) {
    throw new Error(
      `Cannot define a custom field filter on a non-virtual property: DTO: ${DTOClass?.name} Field: ${fieldName}`,
    );
  }
  fieldComparisonRegistry.registerFieldOperation(DTOClass, fieldName, operation, spec);
}

type FilterComparisonOptions<T> = {
  FieldType: Class<T>;
  fieldName: string;
  allowedComparisons?: FilterComparisonOperators<T>[];
  returnTypeFunc?: ReturnTypeFunc;
};

/** @internal */
export function createFilterComparisonType<T>(options: FilterComparisonOptions<T>): Class<FilterFieldComparison<T>> {
  const { FieldType, returnTypeFunc } = options;
  const fieldType = returnTypeFunc ? returnTypeFunc() : FieldType;
  const inputName = getComparisonTypeName(fieldType, options);
  const generator = filterComparisonMap.get(inputName);
  if (generator) {
    return generator() as Class<FilterFieldComparison<T>>;
  }
  const isNotAllowed = (val: FilterComparisonOperators<unknown>) => () =>
    !isInAllowedList(options.allowedComparisons, val as unknown);

  @InputType(inputName)
  class Fc {
    @SkipIf(isNotAllowed('is'), Field(() => Boolean, { nullable: true }))
    @IsBoolean()
    @IsOptional()
    is?: boolean | null;

    @SkipIf(isNotAllowed('isNot'), Field(() => Boolean, { nullable: true }))
    @IsBoolean()
    @IsOptional()
    isNot?: boolean | null;

    @SkipIf(isNotAllowed('eq'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    eq?: T;

    @SkipIf(isNotAllowed('neq'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    neq?: T;

    @SkipIf(isNotAllowed('gt'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    gt?: T;

    @SkipIf(isNotAllowed('gte'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    gte?: T;

    @SkipIf(isNotAllowed('lt'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    lt?: T;

    @SkipIf(isNotAllowed('lte'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    lte?: T;

    @SkipIf(isNotAllowed('like'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    like?: T;

    @SkipIf(isNotAllowed('notLike'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    notLike?: T;

    @SkipIf(isNotAllowed('iLike'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    iLike?: T;

    @SkipIf(isNotAllowed('notILike'), Field(() => fieldType, { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    notILike?: T;

    @SkipIf(isNotAllowed('in'), Field(() => [fieldType], { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    in?: T[];

    @SkipIf(isNotAllowed('notIn'), Field(() => [fieldType], { nullable: true }))
    @IsUndefined()
    @Type(() => FieldType)
    notIn?: T[];
  }

  // Patch this general filter with the additional properties we have registered
  // todo We can probably fix the type cast here
  for (const cmp of (options.allowedComparisons ?? []) as string[]) {
    const op = fieldComparisonRegistry.getTypeComparison(fieldType, cmp);
    // console.log(fieldType, cmp, options.FieldType, options.fieldName, op);
    if (op) {
      patchFieldComparison(Fc, cmp, op);
    }
  }

  filterComparisonMap.set(inputName, () => Fc);
  return Fc as Class<FilterFieldComparison<T>>;
}

export function createVirtualFilterComparisonType(options: {
  DTOClass: Class<unknown>;
  field: string;
}): Class<unknown> {
  const { baseName } = getDTONames(options.DTOClass);
  const field = options.field;
  const inputName = `${baseName}${upperCaseFirst(options.field)}FilterComparison`;

  const generator = filterComparisonMap.get(inputName);
  if (generator) {
    return generator();
  }

  @InputType(inputName)
  class Fc {}

  const comparisons = fieldComparisonRegistry.getFieldComparisons(options.DTOClass, field);

  for (const cmp of comparisons) {
    patchFieldComparison(Fc, cmp.operation, cmp.spec);
  }

  filterComparisonMap.set(inputName, () => Fc);
  return Fc;
}
