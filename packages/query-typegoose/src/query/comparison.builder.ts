import { CommonFieldComparisonBetweenType, FilterComparisonOperators } from '@ptc-org/nestjs-query-core';
import escapeRegExp from 'lodash.escaperegexp';
import { BadRequestException } from '@nestjs/common';
import { ReturnModelType, mongoose } from '@typegoose/typegoose';
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

  constructor(
    readonly Model: ReturnModelType<new () => Entity>,
    readonly comparisonMap: Record<string, string> = ComparisonBuilder.DEFAULT_COMPARISON_MAP,
  ) {}

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
  ): mongoose.FilterQuery<Entity> {
    const schemaKey = getSchemaKey(`${String(field)}`);
    const normalizedCmp = (cmp as string).toLowerCase();
    let querySelector: mongoose.FilterQuery<Entity[F]> | undefined;
    if (this.comparisonMap[normalizedCmp]) {
      // comparison operator (e.b. =, !=, >, <)
      querySelector = {
        [this.comparisonMap[normalizedCmp]]: this.convertQueryValue(field, val as Entity[F]),
      } as mongoose.FilterQuery<Entity[F]>;
    }
    if (normalizedCmp.includes('like')) {
      // @ts-ignore
      querySelector = this.likeComparison(normalizedCmp, val);
    }
    if (normalizedCmp.includes('between')) {
      querySelector = this.betweenComparison(normalizedCmp, field, val);
    }
    if (!querySelector) {
      throw new BadRequestException(`unknown operator ${JSON.stringify(cmp)}`);
    }
    return { [schemaKey]: querySelector } as mongoose.FilterQuery<Entity>;
  }

  private betweenComparison<F extends keyof Entity>(
    cmp: string,
    field: F,
    val: EntityComparisonField<Entity, F>,
  ): mongoose.FilterQuery<Entity[F]> {
    if (!this.isBetweenVal(val)) {
      throw new Error(`Invalid value for ${cmp} expected {lower: val, upper: val} got ${JSON.stringify(val)}`);
    }
    if (cmp === 'notbetween') {
      return { $lt: this.convertQueryValue(field, val.lower), $gt: this.convertQueryValue(field, val.upper) };
    }
    return { $gte: this.convertQueryValue(field, val.lower), $lte: this.convertQueryValue(field, val.upper) };
  }

  private isBetweenVal<F extends keyof Entity>(
    val: EntityComparisonField<Entity, F>,
  ): val is CommonFieldComparisonBetweenType<Entity[F]> {
    return val !== null && typeof val === 'object' && 'lower' in val && 'upper' in val;
  }

  private likeComparison<F extends keyof Entity>(
    cmp: string,
    val: EntityComparisonField<Entity, F>,
  ): mongoose.FilterQuery<RegExp> {
    const regExpStr = escapeRegExp(`${String(val)}`).replace(/%/g, '.*');
    const regExp = new RegExp(regExpStr, cmp.includes('ilike') ? 'i' : undefined);
    if (cmp.startsWith('not')) {
      return { $not: { $regex: regExp } };
    }
    return { $regex: regExp };
  }

  private convertQueryValue<F extends keyof Entity>(field: F, val: Entity[F]): Entity[F] {
    const schemaType = this.Model.schema.path(getSchemaKey(field as string));
    if (!schemaType) {
      throw new BadRequestException(`unknown comparison field ${String(field)}`);
    }
    if (schemaType instanceof mongoose.Schema.Types.ObjectId) {
      return this.convertToObjectId(val) as Entity[F];
    }
    return val;
  }

  private convertToObjectId(val: unknown): unknown {
    if (Array.isArray(val)) {
      return val.map((v) => this.convertToObjectId(v));
    }
    if (typeof val === 'string' || typeof val === 'number') {
      if (mongoose.Types.ObjectId.isValid(val)) {
        return new mongoose.Types.ObjectId(val);
      }
    }
    return val;
  }
}
