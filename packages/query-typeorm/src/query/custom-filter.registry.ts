import { Class } from '@nestjs-query/core';
import { ColumnType, ObjectLiteral } from 'typeorm';

export type CustomFilterResult = { sql: string; params: ObjectLiteral };

export interface CustomFilterContext {
  fieldType?: ColumnType;
}

export interface CustomFilter<OperationType = string, Entity = unknown> {
  apply(
    field: keyof Entity | string,
    cmp: OperationType,
    val: unknown,
    alias?: string,
    context?: CustomFilterContext,
  ): CustomFilterResult;
}

type OperationCustomFilters = Record<string, CustomFilter>;

type SetFilterSpec =
  | { types: ColumnType[]; operations: string[] }
  | { klass: Class<unknown>; field: string; operations: string[] };

export class CustomFilterRegistry {
  // Registry for (class, field) filters
  private cfoRegistry: Map<Class<unknown>, Record<string | symbol | number, OperationCustomFilters>> = new Map();

  // Registry for (type) filters
  private tRegistry: Map<ColumnType, OperationCustomFilters> = new Map();

  getFilter<Entity = unknown>(
    operation: string,
    type?: ColumnType, // Type is optional, since we might have non property-backed filters
    klass?: Class<Entity>,
    field?: keyof Entity | string,
  ): CustomFilter<string, Entity> | undefined {
    // Most specific: (class, field) filters.
    if (klass && field) {
      const flt = this.cfoRegistry.get(klass)?.[field]?.[operation];
      if (flt) {
        return flt;
      }
    }
    // Type filters
    if (type) {
      return this.tRegistry.get(type)?.[operation];
    }
    return undefined;
  }

  /**
   * We have 2 types of filters:
   * - (type, operation) global filters
   * - (class, field, operation) filters
   * type is the database column type (TypeORM's ColumnType)
   * Specificity of the filters increases from top to bottom
   */
  setFilter<Entity>(filter: CustomFilter<string, Entity>, opts: SetFilterSpec): void {
    if ('klass' in opts && 'field' in opts) {
      const { klass, field, operations } = opts;
      if (!operations || operations.length === 0) {
        throw new Error('Cannot register a filter without operations, please define the operations array');
      }
      const entityFilters = this.cfoRegistry.get(klass) || {};
      entityFilters[field] = this.createCustomFilterOperationMap(filter, operations);
      this.cfoRegistry.set(klass, entityFilters);
    } else if ('types' in opts) {
      const { types, operations } = opts;
      if (!types || types.length === 0) {
        throw new Error('Cannot register a (type) filter without types, please define the types array');
      }
      if (!operations || operations.length === 0) {
        throw new Error('Cannot register a filter without operations, please define the operations array');
      }
      for (const type of types) {
        this.tRegistry.set(type, this.createCustomFilterOperationMap(filter, operations));
      }
    }
  }

  private createCustomFilterOperationMap(cf: CustomFilter, operations: string[]): OperationCustomFilters {
    const ocf: OperationCustomFilters = {};
    for (const op of operations) {
      ocf[op] = cf;
    }
    return ocf;
  }
}
