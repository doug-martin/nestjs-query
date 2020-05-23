import { FilterComparisonOperators } from '@nestjs-query/core';
import { Op, WhereOptions } from 'sequelize';

/**
 * @internal
 */
export type EntityComparisonField<Entity, F extends keyof Entity> = Entity[F] | Entity[F][] | true | false | null;

/**
 * @internal
 * Builder to create SQL Comparisons. (=, !=, \>, etc...)
 */
export class SQLComparisionBuilder<Entity> {
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

  constructor(readonly comparisonMap: Record<string, symbol> = SQLComparisionBuilder.DEFAULT_COMPARISON_MAP) {}

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
  ): WhereOptions {
    const col = `${field as string}`;
    const normalizedCmp = (cmp as string).toLowerCase();
    if (this.comparisonMap[normalizedCmp]) {
      // comparison operator (e.b. =, !=, >, <)
      return { [col]: { [this.comparisonMap[normalizedCmp]]: val } };
    }
    throw new Error(`unknown operator ${JSON.stringify(cmp)}`);
  }
}
