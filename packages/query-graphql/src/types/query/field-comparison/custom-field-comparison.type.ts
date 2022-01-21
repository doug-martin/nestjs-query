import { Class } from '@nestjs-query/core';
import { InputType } from '@nestjs/graphql';

/** @internal */
const customFieldComparisonMap = new Map<string, Class<unknown>>();

/** @internal */
export function getOrCreateCustomFieldComparison(inputName: string): Class<unknown> {
  let existing = customFieldComparisonMap.get(inputName);
  if (existing) {
    return existing;
  }

  @InputType(inputName)
  class FieldComparison {}

  existing = FieldComparison;
  customFieldComparisonMap.set(inputName, existing);
  return existing;
}
