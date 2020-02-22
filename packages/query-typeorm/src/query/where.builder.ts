import { Brackets, Repository, WhereExpression } from 'typeorm';
import { Filter, FilterComparisonOperators, FilterComparisons, FilterFieldComparison } from '@nestjs-query/core';
import { EntityComparisonField, SQLComparisionBuilder } from './sql-comparison.builder';

/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
export class WhereBuilder<Entity> {
  constructor(
    readonly repository: Repository<Entity>,
    readonly sqlComparisionBuilder: SQLComparisionBuilder<Entity> = new SQLComparisionBuilder<Entity>(repository),
  ) {}

  /**
   * Builds a WHERE clause from a Filter.
   * @param where - the `typeorm` WhereExpression
   * @param filter - the filter to build the WHERE clause from.
   * @param alias - optional alias to use to qualify an identifier
   */
  build<Where extends WhereExpression>(where: Where, filter: Filter<Entity>, alias?: string): Where {
    const { and, or } = filter;
    if (and && and.length) {
      this.filterAnd(where, and, alias);
    }
    if (or && or.length) {
      this.filterOr(where, or, alias);
    }
    return this.filterFields(where, filter, alias);
  }

  /**
   * ANDs multiple filters together. This will properly group every clause to ensure proper precedence.
   *
   * @param where - the `typeorm` WhereExpression
   * @param filters - the array of filters to AND together
   * @param alias - optional alias to use to qualify an identifier
   */
  private filterAnd<Where extends WhereExpression>(where: Where, filters: Filter<Entity>[], alias?: string): Where {
    return filters.reduce((w, f) => w.andWhere(this.createBrackets(f, alias)), where);
  }

  /**
   * ORs multiple filters together. This will properly group every clause to ensure proper precedence.
   *
   * @param where - the `typeorm` WhereExpression
   * @param filters - the array of filters to OR together
   * @param alias - optional alias to use to qualify an identifier
   */
  private filterOr<Where extends WhereExpression>(where: Where, filter: Filter<Entity>[], alias?: string): Where {
    return filter.reduce((w, f) => where.orWhere(this.createBrackets(f, alias)), where);
  }

  /**
   * Wraps a filter in brackes to ensure precedence.
   * ```
   * {a: { eq: 1 } } // "(a = 1)"
   * {a: { eq: 1 }, b: { gt: 2 } } // "((a = 1) AND (b > 2))"
   * ```
   * @param filter - the filter to wrap in brackets.
   * @param alias - optional alias to use to qualify an identifier
   */
  private createBrackets(filter: Filter<Entity>, alias?: string): Brackets {
    return new Brackets(qb => this.build(qb, filter, alias));
  }

  /**
   * Creates field comparisons from a filter. This method will ignore and/or properties.
   * @param where - the `typeorm` WhereExpression
   * @param filter - the filter with fields to create comparisons for.
   * @param alias - optional alias to use to qualify an identifier
   */
  private filterFields<Where extends WhereExpression>(where: Where, filter: Filter<Entity>, alias?: string): Where {
    return Object.keys(filter).reduce((w, field) => {
      if (field !== 'and' && field !== 'or') {
        return this.withFilterComparison(
          where,
          field as keyof Entity,
          this.getField(filter, field as keyof Entity),
          alias,
        );
      }
      return w;
    }, where);
  }

  private getField<K extends keyof FilterComparisons<Entity>>(
    obj: FilterComparisons<Entity>,
    field: K,
  ): FilterFieldComparison<Entity[K]> {
    return obj[field] as FilterFieldComparison<Entity[K]>;
  }

  private withFilterComparison<T extends keyof Entity, Where extends WhereExpression>(
    where: Where,
    field: T,
    cmp: FilterFieldComparison<Entity[T]>,
    alias?: string,
  ): Where {
    return where.andWhere(
      new Brackets(qb => {
        const opts = Object.keys(cmp) as FilterComparisonOperators<Entity[T]>[];
        const sqlComparisons = opts.map(cmpType =>
          this.sqlComparisionBuilder.build(field, cmpType, cmp[cmpType] as EntityComparisonField<Entity, T>, alias),
        );
        sqlComparisons.map(({ sql, params }) => qb.orWhere(sql, params));
      }),
    );
  }
}
