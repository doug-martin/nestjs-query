import { CommonFieldComparisonBetweenType, FilterComparisonOperators } from '@nestjs-query/core';
import { Op, WhereOptions, Rangable } from 'sequelize';

/**
 * @internal
 */
export type EntityComparisonField<Entity, F extends keyof Entity> =
  | Entity[F]
  | Entity[F][]
  | CommonFieldComparisonBetweenType<Entity[F]>
  | true
  | false
  | null;

/**
 * @internal
 * Builder to create SQL Comparisons. (=, !=, \>, etc...)
 */
export class SQLComparisonBuilder<Entity> {
  static DEFAULT_COMPARISON_MAP: Record<string, symbol> = {
    eq: Op.eq,
    neq: Op.ne,
    gt: Op.gt,
    gte: Op.gte,
    lt: Op.lt,
    lte: Op.lte,
    like: Op.like,
    in: Op.in,
    notin: Op.notIn,
    notlike: Op.notLike,
    ilike: Op.iLike,
    notilike: Op.notILike,
    is: Op.is,
    isnot: Op.not,
  };

  constructor(readonly comparisonMap: Record<string, symbol> = SQLComparisonBuilder.DEFAULT_COMPARISON_MAP) {}

  /**
   * Creates a valid SQL fragment with parameters.
   *
   * @param field - the property in Entity to create the comparison for.
   * @param cmp - the FilterComparisonOperator (eq, neq, gt, etc...)
   * @param val - the value to compare to.
   */
  build<F extends keyof Entity>(
    field: F,
    cmp: FilterComparisonOperators<Entity[F]>,
    val: EntityComparisonField<Entity, F>,
    alias?: string,
  ): WhereOptions {
    const col = alias ? `$${alias}.${field as string}$` : `${field as string}`;
    const normalizedCmp = (cmp as string).toLowerCase();
    if (this.comparisonMap[normalizedCmp]) {
      // comparison operator (e.b. =, !=, >, <)
      return { [col]: { [this.comparisonMap[normalizedCmp]]: val } };
    }
    if (normalizedCmp === 'between') {
      // between comparison (field BETWEEN x AND y)
      return this.betweenComparisonSQL(col, val);
    }
    if (normalizedCmp === 'notbetween') {
      // notBetween comparison (field NOT BETWEEN x AND y)
      return this.notBetweenComparisonSQL(col, val);
    }
    throw new Error(`unknown operator ${JSON.stringify(cmp)}`);
  }

  private betweenComparisonSQL<F extends keyof Entity>(
    col: string,
    val: EntityComparisonField<Entity, F>,
  ): WhereOptions {
    if (this.isBetweenVal(val)) {
      return {
        [col]: { [Op.between]: [val.lower, val.upper] as unknown as Rangable },
      };
    }
    throw new Error(`Invalid value for between expected {lower: val, upper: val} got ${JSON.stringify(val)}`);
  }

  private notBetweenComparisonSQL<F extends keyof Entity>(
    col: string,
    val: EntityComparisonField<Entity, F>,
  ): WhereOptions {
    if (this.isBetweenVal(val)) {
      return {
        [col]: { [Op.notBetween]: [val.lower, val.upper] as unknown as Rangable },
      };
    }
    throw new Error(`Invalid value for not between expected {lower: val, upper: val} got ${JSON.stringify(val)}`);
  }

  private isBetweenVal<F extends keyof Entity>(
    val: EntityComparisonField<Entity, F>,
  ): val is CommonFieldComparisonBetweenType<Entity[F]> {
    return val !== null && typeof val === 'object' && 'lower' in val && 'upper' in val;
  }
}
