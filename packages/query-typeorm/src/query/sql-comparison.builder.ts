import { ObjectLiteral, Repository } from 'typeorm';
import { FilterComparisonOperators } from '@nestjs-query/core';
import { AbstractQueryBuilder } from './query-builder.abstract';

type CmpSQLType = { sql: string; params: ObjectLiteral };
export type EntityComparisonField<Entity, F extends keyof Entity> = Entity[F] | Entity[F][] | true | false | null;

export class SQLComparisionBuilder<Entity> extends AbstractQueryBuilder<Entity> {
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

  constructor(
    repo: Repository<Entity>,
    readonly comparisonMap: Record<string, string> = SQLComparisionBuilder.DEFAULT_COMPARISON_MAP,
  ) {
    super(repo);
  }

  private get paramName(): string {
    const param = `param${this.paramCount}`;
    this.paramCount = this.paramCount + 1;
    return param;
  }

  build<F extends keyof Entity>(
    field: F,
    cmp: FilterComparisonOperators<Entity[F]>,
    val: EntityComparisonField<Entity, F>,
  ): CmpSQLType {
    const col = this.fieldToDbCol(field);
    const normalizedCmp = (cmp as string).toLowerCase();
    if (this.comparisonMap[normalizedCmp]) {
      return this.createComparisonSQL(normalizedCmp, col, val);
    }
    if (normalizedCmp === 'is') {
      return this.isSQLCmp(col, val);
    }
    if (normalizedCmp === 'in') {
      return this.inSQLCmp(col, val);
    }
    if (normalizedCmp === 'notin') {
      return this.notInSQLCmp(col, val);
    }
    throw new Error(`unknown operator "${cmp}"`);
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

  private isSQLCmp<F extends keyof Entity>(col: string, val: EntityComparisonField<Entity, F>): CmpSQLType {
    if (val === null) {
      return { sql: `${col} IS NULL`, params: {} };
    }
    if (val === true) {
      return { sql: `${col} IS TRUE`, params: {} };
    }
    if (val === false) {
      return { sql: `${col} IS FALSE`, params: {} };
    }
    throw new Error(`unexpected is operator param ${val}`);
  }

  private inSQLCmp<F extends keyof Entity>(col: string, val: EntityComparisonField<Entity, F>): CmpSQLType {
    this.checkNonEmptyArray(val);
    const { paramName } = this;
    return {
      sql: `${col} IN (:...${paramName})`,
      params: { [paramName]: val },
    };
  }

  private notInSQLCmp<F extends keyof Entity>(col: string, val: EntityComparisonField<Entity, F>): CmpSQLType {
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
