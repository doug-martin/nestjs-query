import { Filter, FilterComparisons, FilterFieldComparison } from '@ptc-org/nestjs-query-core';
import { ReturnModelType, mongoose } from '@typegoose/typegoose';
import { EntityComparisonField, ComparisonBuilder } from './comparison.builder';

/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
export class WhereBuilder<Entity> {
  constructor(
    readonly Model: ReturnModelType<new () => Entity>,
    readonly comparisonBuilder: ComparisonBuilder<Entity> = new ComparisonBuilder<Entity>(Model)
  ) {}

  /**
   * Builds a WHERE clause from a Filter.
   * @param filter - the filter to build the WHERE clause from.
   */
  public build(filter: Filter<Entity>): mongoose.FilterQuery<new () => Entity> {
    const { and, or } = filter;
    let ands: mongoose.FilterQuery<Entity>[] = [];
    let ors: mongoose.FilterQuery<Entity>[] = [];
    let filterQuery: mongoose.FilterQuery<Entity> = {};

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
      filterQuery = { ...filterQuery, $and: ands };
    }

    if (ors.length) {
      filterQuery = { ...filterQuery, $or: ors };
    }

    return filterQuery;
  }

  /**
   * Creates field comparisons from a filter. This method will ignore and/or properties.
   * @param filter - the filter with fields to create comparisons for.
   */
  private filterFields(filter: Filter<Entity>): mongoose.FilterQuery<Entity> | undefined {
    const ands = Object.keys(filter)
      .filter((f) => f !== 'and' && f !== 'or')
      .map((field) => this.withFilterComparison(field as keyof Entity, this.getField(filter, field as keyof Entity)));

    if (ands.length === 1) {
      return ands[0];
    }

    if (ands.length) {
      return { $and: ands } as mongoose.FilterQuery<Entity>;
    }

    return undefined;
  }

  private getField<K extends keyof FilterComparisons<Entity>>(
    obj: FilterComparisons<Entity>,
    field: K
  ): FilterFieldComparison<Entity[K]> {
    return obj[field] as FilterFieldComparison<Entity[K]>;
  }

  private withFilterComparison<T extends keyof Entity>(
    field: T,
    cmp: FilterFieldComparison<Entity[T]>
  ): mongoose.FilterQuery<Entity> {
    const opts = Object.keys(cmp) as (keyof FilterFieldComparison<Entity[T]>)[];
    if (opts.length === 1) {
      const cmpType = opts[0];
      return this.comparisonBuilder.build(field, cmpType, cmp[cmpType] as EntityComparisonField<Entity, T>);
    }
    return {
      $or: opts.map((cmpType) => this.comparisonBuilder.build(field, cmpType, cmp[cmpType] as EntityComparisonField<Entity, T>))
    } as mongoose.FilterQuery<Entity>;
  }
}
