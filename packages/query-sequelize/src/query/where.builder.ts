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
   * @param where - the `typeorm` WhereExpression
   * @param filter - the filter to build the WHERE clause from.
   * @param alias - optional alias to use to qualify an identifier
   */
  build(filter: Filter<Entity>, alias?: string): WhereOptions {
    const { and } = filter;
    let ands: WhereOptions[] = [];
    // let ors: WhereOptions[] = [];
    if (and && and.length) {
      ands = and.map((f) => this.build(f));
    }
    // if (or && or.length) {
    //   ors = or.map(f => this.build(f));
    // }
    ands = [...ands, this.filterFields(filter, alias)];
    return {
      [Op.and]: ands,
    };
  }

  /**
   * Creates field comparisons from a filter. This method will ignore and/or properties.
   * @param where - the `typeorm` WhereExpression
   * @param filter - the filter with fields to create comparisons for.
   * @param alias - optional alias to use to qualify an identifier
   */
  private filterFields(filter: Filter<Entity>, alias?: string): WhereOptions {
    const ands = Object.keys(filter)
      .filter((f) => f !== 'and' && f !== 'or')
      .map((field) =>
        this.withFilterComparison(field as keyof Entity, this.getField(filter, field as keyof Entity), alias),
      );
    return { [Op.and]: ands as WhereOptions[] };
  }

  private getField<K extends keyof FilterComparisons<Entity>>(
    obj: FilterComparisons<Entity>,
    field: K,
  ): FilterFieldComparison<Entity[K]> {
    return obj[field] as FilterFieldComparison<Entity[K]>;
  }

  private withFilterComparison<T extends keyof Entity>(
    field: T,
    cmp: FilterFieldComparison<Entity[T]>,
    alias?: string,
  ): WhereOptions {
    const opts = Object.keys(cmp) as FilterComparisonOperators<Entity[T]>[];
    return {
      [Op.or]: opts.map((cmpType) =>
        this.sqlComparisionBuilder.build(field, cmpType, cmp[cmpType] as EntityComparisonField<Entity, T>, alias),
      ),
    };
  }
}
