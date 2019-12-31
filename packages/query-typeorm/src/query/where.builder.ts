import { Brackets, Repository, WhereExpression } from 'typeorm';
import { Filter, FilterComparisonOperators, FilterComparisons, FilterFieldComparison } from '@nestjs-query/core';
import { EntityComparisonField, SQLComparisionBuilder } from './sql-comparison.builder';

export class WhereBuilder<Entity> {
  constructor(
    readonly repository: Repository<Entity>,
    readonly sqlComparisionBuilder: SQLComparisionBuilder<Entity> = new SQLComparisionBuilder<Entity>(repository),
  ) {}

  build<Where extends WhereExpression>(where: Where, filter: Filter<Entity>): Where {
    const { and, or } = filter;
    if (and && and.length) {
      this.filterAnd(where, and);
    }
    if (or && or.length) {
      this.filterOr(where, or);
    }
    return this.filterFields(where, filter);
  }

  private filterAnd<Where extends WhereExpression>(where: Where, filter: Filter<Entity>[]): Where {
    return filter.reduce((w, f) => w.andWhere(this.createBrackets(f)), where);
  }

  private filterOr<Where extends WhereExpression>(where: Where, filter: Filter<Entity>[]): Where {
    return filter.reduce((w, f) => where.orWhere(this.createBrackets(f)), where);
  }

  private createBrackets(filter: Filter<Entity>): Brackets {
    return new Brackets(qb => this.build(qb, filter));
  }

  private filterFields<Where extends WhereExpression>(where: Where, filter: Filter<Entity>): Where {
    return Object.keys(filter).reduce((w, field) => {
      if (field !== 'and' && field !== 'or') {
        return this.withFilterComparison(where, field as keyof Entity, this.getField(filter, field as keyof Entity));
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
  ): Where {
    return where.andWhere(
      new Brackets(qb => {
        const opts = Object.keys(cmp) as FilterComparisonOperators<Entity[T]>[];
        const sqlComparisons = opts.map(cmpType =>
          this.sqlComparisionBuilder.build(field, cmpType, cmp[cmpType] as EntityComparisonField<Entity, T>),
        );
        sqlComparisons.map(({ sql, params }) => qb.orWhere(sql, params));
      }),
    );
  }
}
