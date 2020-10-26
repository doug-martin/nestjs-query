import { CommonFieldComparisonBetweenType, FilterComparisonOperators } from '@nestjs-query/core';
import escapeRegExp from 'lodash.escaperegexp';
import { FilterQuery } from 'mongoose';
import { QuerySelector } from 'mongodb';
import { getSchemaKey } from './helpers';

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
export class ComparisonBuilder<Entity> {
  static DEFAULT_COMPARISON_MAP: Record<string, string> = {
    eq: '$eq',
    neq: '$ne',
    gt: '$gt',
    gte: '$gte',
    lt: '$lt',
    lte: '$lte',
    in: '$in',
    notin: '$nin',
    is: '$eq',
    isnot: '$ne',
  };

  constructor(readonly comparisonMap: Record<string, string> = ComparisonBuilder.DEFAULT_COMPARISON_MAP) {}

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
  ): FilterQuery<Entity> {
    const schemaKey = getSchemaKey(`${String(field)}`);
    const normalizedCmp = (cmp as string).toLowerCase();
    let querySelector: QuerySelector<Entity[F]> | undefined;
    if (this.comparisonMap[normalizedCmp]) {
      // comparison operator (e.b. =, !=, >, <)
      querySelector = { [this.comparisonMap[normalizedCmp]]: val };
    }
    if (normalizedCmp.includes('like')) {
      querySelector = (this.likeComparison(normalizedCmp, val) as unknown) as QuerySelector<Entity[F]>;
    }
    if (normalizedCmp === 'between') {
      // between comparison (field BETWEEN x AND y)
      querySelector = this.betweenComparison(val);
    }
    if (normalizedCmp === 'notbetween') {
      // notBetween comparison (field NOT BETWEEN x AND y)
      querySelector = this.notBetweenComparison(val);
    }
    if (!querySelector) {
      throw new Error(`unknown operator ${JSON.stringify(cmp)}`);
    }
    return { [schemaKey]: querySelector } as FilterQuery<Entity>;
  }

  private betweenComparison<F extends keyof Entity>(val: EntityComparisonField<Entity, F>): QuerySelector<Entity[F]> {
    if (this.isBetweenVal(val)) {
      return { $gte: val.lower, $lte: val.upper };
    }
    throw new Error(`Invalid value for between expected {lower: val, upper: val} got ${JSON.stringify(val)}`);
  }

  private notBetweenComparison<F extends keyof Entity>(
    val: EntityComparisonField<Entity, F>,
  ): QuerySelector<Entity[F]> {
    if (this.isBetweenVal(val)) {
      return { $lt: val.lower, $gt: val.upper };
    }
    throw new Error(`Invalid value for not between expected {lower: val, upper: val} got ${JSON.stringify(val)}`);
  }

  private isBetweenVal<F extends keyof Entity>(
    val: EntityComparisonField<Entity, F>,
  ): val is CommonFieldComparisonBetweenType<Entity[F]> {
    return val !== null && typeof val === 'object' && 'lower' in val && 'upper' in val;
  }

  private likeComparison<F extends keyof Entity>(
    cmp: string,
    val: EntityComparisonField<Entity, F>,
  ): QuerySelector<string> {
    const regExpStr = escapeRegExp(`${String(val)}`).replace(/%/g, '.*');
    const regExp = new RegExp(regExpStr, cmp.includes('ilike') ? 'i' : undefined);
    if (cmp.startsWith('not')) {
      return { $not: { $regex: regExp } };
    }
    return { $regex: regExp };
  }
}
