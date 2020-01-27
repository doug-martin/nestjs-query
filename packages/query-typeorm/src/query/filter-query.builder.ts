import { Filter, Paging, Query, SortField } from '@nestjs-query/core';
import {
  DeleteQueryBuilder,
  QueryBuilder,
  Repository,
  SelectQueryBuilder,
  UpdateQueryBuilder,
  WhereExpression,
} from 'typeorm';
import { WhereBuilder } from './where.builder';
import { AbstractQueryBuilder } from './query-builder.abstract';

/**
 * @internal
 *
 * Interface that for Typeorm query builders that are sortable.
 */
interface Sortable<Entity> extends QueryBuilder<Entity> {
  addOrderBy(sort: string, order?: 'ASC' | 'DESC', nulls?: 'NULLS FIRST' | 'NULLS LAST'): this;
}

/**
 * @internal
 *
 * Interface for `typeorm` query builders that are pageable.
 */
interface Pageable<Entity> extends QueryBuilder<Entity> {
  limit(limit?: number): this;
  offset(offset?: number): this;
}

/**
 * @internal
 *
 * Class that will convert a Query into a `typeorm` Query Builder.
 */
export class FilterQueryBuilder<Entity> extends AbstractQueryBuilder<Entity> {
  constructor(
    readonly repo: Repository<Entity>,
    readonly whereBuilder: WhereBuilder<Entity> = new WhereBuilder<Entity>(repo),
  ) {
    super(repo);
  }

  /**
   * Create a `typeorm` SelectQueryBuilder with `WHERE`, `ORDER BY` and `LIMIT/OFFSET` clauses.
   *
   * @param query - the query to apply.
   */
  select(query: Query<Entity>): SelectQueryBuilder<Entity> {
    let qb = this.applyFilter(this.createQueryBuilder(), query.filter);
    qb = this.applySorting(qb, query.sorting);
    qb = this.applyPaging(qb, query.paging);
    return qb;
  }

  /**
   * Create a `typeorm` DeleteQueryBuilder with a WHERE clause.
   *
   * @param query - the query to apply.
   */
  delete(query: Query<Entity>): DeleteQueryBuilder<Entity> {
    return this.applyFilter(this.repo.createQueryBuilder().delete(), query.filter);
  }

  /**
   * Create a `typeorm` UpdateQueryBuilder with `WHERE` and `ORDER BY` clauses
   *
   * @param query - the query to apply.
   */
  update(query: Query<Entity>): UpdateQueryBuilder<Entity> {
    const qb = this.applyFilter(this.repo.createQueryBuilder().update(), query.filter);
    return this.applySorting(qb, query.sorting);
  }

  /**
   * Applies paging to a Pageable `typeorm` query builder
   * @param qb - the `typeorm` QueryBuilder
   * @param paging - the Paging options.
   */
  private applyPaging<P extends Pageable<Entity>>(qb: P, paging?: Paging): P {
    if (!paging) {
      return qb;
    }
    return qb.limit(paging.limit).offset(paging.offset);
  }

  /**
   * Applies the filter from a Query to a `typeorm` QueryBuilder.
   *
   * @param qb - the `typeorm` QueryBuilder.
   * @param filter - the filter.
   */
  private applyFilter<Where extends WhereExpression>(qb: Where, filter?: Filter<Entity>): Where {
    if (!filter) {
      return qb;
    }
    return this.whereBuilder.build(qb, filter);
  }

  /**
   * Applies the ORDER BY clause to a `typeorm` QueryBuilder.
   * @param qb - the `typeorm` QueryBuilder.
   * @param sorts - an array of SortFields to create the ORDER BY clause.
   */
  private applySorting<T extends Sortable<Entity>>(qb: T, sorts?: SortField<Entity>[]): T {
    if (!sorts) {
      return qb;
    }
    return sorts.reduce((prevQb, { field, direction, nulls }) => {
      return prevQb.addOrderBy(this.fieldToDbCol(field), direction, nulls);
    }, qb);
  }

  /**
   * Create a `typeorm` SelectQueryBuilder which can be used as an entry point to create update, delete or insert
   * QueryBuilders.
   */
  private createQueryBuilder(): SelectQueryBuilder<Entity> {
    return this.repo.createQueryBuilder();
  }
}
