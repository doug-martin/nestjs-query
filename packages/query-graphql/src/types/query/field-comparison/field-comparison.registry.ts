import { Class } from '@nestjs-query/core';
import { ReturnTypeFuncValue } from '@nestjs/graphql';

// TODO Maybe we can properly type these?
function deepMapSet(map: Map<unknown, unknown>, keys: unknown[], val: unknown) {
  let m = map;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!m.has(k)) {
      m.set(k, new Map());
    }
    m = m.get(k) as Map<unknown, unknown>;
  }
  m.set(keys[keys.length - 1], val);
}

function deepMapGet(map: Map<unknown, unknown>, keys: unknown[]): unknown | undefined {
  let m = map;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    m = map.get(k) as Map<unknown, unknown>;
    if (m === undefined) {
      return undefined;
    }
  }
  return m.get(keys[keys.length - 1]);
}

type OperationType = string | symbol;

/** @internal */
export interface FieldComparisonSpec<T> {
  FilterType: Class<T>;
  GqlType?: ReturnTypeFuncValue;
  decorators?: PropertyDecorator[];
}

/** @internal */
export class FieldComparisonRegistry {
  // (type, operation) registry
  private toRegistry: Map<ReturnTypeFuncValue, Map<OperationType, FieldComparisonSpec<unknown>>> = new Map();

  // (class, field, operation) registry
  private cfoRegistry: Map<Class<unknown>, Map<string, Map<OperationType, FieldComparisonSpec<unknown>>>> = new Map();

  /**
   * Registers a FieldComparison operation on a given FieldType (i.e. GraphQL Scalar type)
   */
  registerTypeOperation(FieldType: ReturnTypeFuncValue, operation: string, spec: FieldComparisonSpec<unknown>): void {
    deepMapSet(this.toRegistry, [FieldType, operation], spec);
  }

  /**
   * Registers a FieldComparison operation on a given field of a given DTO, this is useful for non type based filters
   * or virtual properties, since the field does not have to exist on the DTO itself.
   */
  registerFieldOperation(
    DTOClass: Class<unknown>,
    fieldName: string,
    operation: OperationType,
    spec: FieldComparisonSpec<unknown>,
  ): void {
    deepMapSet(this.cfoRegistry, [DTOClass, fieldName, operation], spec);
  }

  getTypeComparison(
    FieldType: ReturnTypeFuncValue,
    operation?: OperationType,
  ): FieldComparisonSpec<unknown> | undefined {
    return deepMapGet(this.toRegistry, [FieldType, operation]) as FieldComparisonSpec<unknown>;
  }

  getDefinedFieldsForDTO(DTOClass: Class<unknown>): string[] {
    return Array.from(this.cfoRegistry.get(DTOClass)?.keys() ?? []);
  }

  getFieldComparisons(
    DTOClass: Class<unknown>,
    fieldName: string,
  ): { operation: string; spec: FieldComparisonSpec<unknown> }[] {
    const opMap = deepMapGet(this.cfoRegistry, [DTOClass, fieldName]) as Map<string, FieldComparisonSpec<unknown>>;
    return Array.from(opMap.entries()).map(([operation, spec]) => ({ operation, spec }));
  }
}
