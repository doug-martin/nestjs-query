import { ObjectLiteral } from 'typeorm';
import { FilterComparisonOperators } from '@nestjs-query/core';

/**
 * @internal
 */
type CmpSQLType = { sql: string; params: ObjectLiteral };

/**
 * @internal
 */
export type EntityComparisonField<Entity, F extends keyof Entity> = Entity[F] | Entity[F][] | true | false | null;

/**
 * @internal
 * Builder to create SQL Comparisons. (=, !=, \>, etc...)
 */
export class SQLComparisionBuilder<Entity> {
  paramCount = 0;

  static DEFAULT_COMPARISON_MAP: Record<string, string> = {
    eq: '=',
    neq: '!=',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    like: 'LIKE',
    notlike: 'NOT LIKE',
    ilike: 'ILIKE',
    notilike: 'NOT ILIKE',
  };

  constructor(readonly comparisonMap: Record<string, string> = SQLComparisionBuilder.DEFAULT_COMPARISON_MAP) {}

  private get paramName(): string {
    const param = `param${this.paramCount}`;
    this.paramCount += 1;
    return param;
  }

  /**
   * Creates a valid SQL fragment with parameters.
   *
   * @param field - the property in Entity to create the comparison for.
   * @param cmp - the FilterComparisonOperator (eq, neq, gt, etc...)
   * @param val - the value to compare to
   * @param alias - alias for the field.
   */
  build<F extends keyof Entity>(
    field: F,
    cmp: FilterComparisonOperators<Entity[F]>,
    val: EntityComparisonField<Entity, F>,
    alias?: string,
  ): CmpSQLType {
    const col = alias ? `${alias}.${field as string}` : `${field as string}`;
    const normalizedCmp = (cmp as string).toLowerCase();
    if (this.comparisonMap[normalizedCmp]) {
      // comparison operator (e.b. =, !=, >, <)
      return this.createComparisonSQL(normalizedCmp, col, val);
    }
    if (normalizedCmp === 'is') {
      // is comparision (IS TRUE, IS FALSE, IS NULL)
      return this.isComparisonSQL(col, val);
    }
    if (normalizedCmp === 'isnot') {
      // is comparision (IS NOT TRUE, IS NOT FALSE, IS NOT NULL, etc...)
      return this.isNotComparisonSQL(col, val);
    }
    if (normalizedCmp === 'in') {
      // in comparision (field IN (1,2,3))
      return this.inComparisonSQL(col, val);
    }
    if (normalizedCmp === 'notin') {
      // in comparision (field IN (1,2,3))
      return this.notInComparisionSQL(col, val);
    }
    throw new Error(`unknown operator ${JSON.stringify(cmp)}`);
  }

  private createComparisonSQL<F extends keyof Entity>(
    cmp: string,
    col: string,
    val: EntityComparisonField<Entity, F>,
  ): CmpSQLType {
    const operator = this.comparisonMap[cmp];
    const { paramName } = this;
    return { sql: `${col} ${operator} :${paramName}`, params: { [paramName]: val } };
  }

  private isComparisonSQL<F extends keyof Entity>(col: string, val: EntityComparisonField<Entity, F>): CmpSQLType {
    if (val === null) {
      return { sql: `${col} IS NULL`, params: {} };
    }
    if (val === true) {
      return { sql: `${col} IS TRUE`, params: {} };
    }
    if (val === false) {
      return { sql: `${col} IS FALSE`, params: {} };
    }
    throw new Error(`unexpected is operator param ${JSON.stringify(val)}`);
  }

  private isNotComparisonSQL<F extends keyof Entity>(col: string, val: EntityComparisonField<Entity, F>): CmpSQLType {
    if (val === null) {
      return { sql: `${col} IS NOT NULL`, params: {} };
    }
    if (val === true) {
      return { sql: `${col} IS NOT TRUE`, params: {} };
    }
    if (val === false) {
      return { sql: `${col} IS NOT FALSE`, params: {} };
    }
    throw new Error(`unexpected isNot operator param ${JSON.stringify(val)}`);
  }

  private inComparisonSQL<F extends keyof Entity>(col: string, val: EntityComparisonField<Entity, F>): CmpSQLType {
    this.checkNonEmptyArray(val);
    const { paramName } = this;
    return {
      sql: `${col} IN (:...${paramName})`,
      params: { [paramName]: val },
    };
  }

  private notInComparisionSQL<F extends keyof Entity>(col: string, val: EntityComparisonField<Entity, F>): CmpSQLType {
    this.checkNonEmptyArray(val);
    const { paramName } = this;
    return {
      sql: `${col} NOT IN (:...${paramName})`,
      params: { [paramName]: val },
    };
  }

  private checkNonEmptyArray<F extends keyof Entity>(val: EntityComparisonField<Entity, F>): void {
    if (!Array.isArray(val)) {
      throw new Error(`Invalid in value expected an array got ${JSON.stringify(val)}`);
    }
    if (!val.length) {
      throw new Error(`Invalid in value expected a non-empty array got ${JSON.stringify(val)}`);
    }
  }
}
