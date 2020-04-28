import { WhereOptions, Op } from 'sequelize';
import { Filter, FilterComparisonOperators, FilterComparisons, FilterFieldComparison } from '@nestjs-query/core';
import { EntityComparisonField, SQLComparisionBuilder } from './sql-comparison.builder';

/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
export class WhereBuilder<Entity> {
  constructor(readonly sqlComparisionBuilder: SQLComparisionBuilder<Entity> = new SQLComparisionBuilder<Entity>()) {}

  /**
   * Builds a WHERE clause from a Filter.
   * @param filter - the filter to build the WHERE clause from.
   */
  build(filter: Filter<Entity>): WhereOptions {
    const { and, or } = filter;
    let ands: WhereOptions[] = [];
    let ors: WhereOptions[] = [];
    let whereOpts: WhereOptions = {};
    if (and && and.length) {
      ands = and.map((f) => this.build(f));
    }
    if (or && or.length) {
      ors = or.map((f) => this.build(f));
    }
    const filterAnds = this.filterFields(filter);
    if (filterAnds) {
      ands = [...ands, filterAnds];
    }
    if (ands.length) {
      whereOpts = { ...whereOpts, [Op.and]: ands };
    }
    if (ors.length) {
      whereOpts = { ...whereOpts, [Op.or]: ors };
    }
    return whereOpts;
  }

  /**
   * Creates field comparisons from a filter. This method will ignore and/or properties.
   * @param filter - the filter with fields to create comparisons for.
   */
  private filterFields(filter: Filter<Entity>): WhereOptions | undefined {
    const ands = Object.keys(filter)
      .filter((f) => f !== 'and' && f !== 'or')
      .map((field) => this.withFilterComparison(field as keyof Entity, this.getField(filter, field as keyof Entity)));
    if (ands.length === 1) {
      return ands[0];
    }
    if (ands.length) {
      return { [Op.and]: ands as WhereOptions[] };
    }
    return undefined;
  }

  private getField<K extends keyof FilterComparisons<Entity>>(
    obj: FilterComparisons<Entity>,
    field: K,
  ): FilterFieldComparison<Entity[K]> {
    return obj[field] as FilterFieldComparison<Entity[K]>;
  }

  private withFilterComparison<T extends keyof Entity>(field: T, cmp: FilterFieldComparison<Entity[T]>): WhereOptions {
    const opts = Object.keys(cmp) as FilterComparisonOperators<Entity[T]>[];
    if (opts.length === 1) {
      const cmpType = opts[0];
      return this.sqlComparisionBuilder.build(field, cmpType, cmp[cmpType] as EntityComparisonField<Entity, T>);
    }
    return {
      [Op.or]: opts.map((cmpType) =>
        this.sqlComparisionBuilder.build(field, cmpType, cmp[cmpType] as EntityComparisonField<Entity, T>),
      ),
    };
  }
}
