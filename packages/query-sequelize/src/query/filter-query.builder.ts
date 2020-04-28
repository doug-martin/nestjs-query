import { Filter, Paging, Query, SortField } from '@nestjs-query/core';
import { FindOptions, Filterable, DestroyOptions, Order, OrderItem, UpdateOptions } from 'sequelize';
import { WhereBuilder } from './where.builder';

/**
 * @internal
 *
 * Interface that for `sequelize` query builders that are sortable.
 */
interface Sortable<Entity> {
  order?: Order;
}

/**
 * @internal
 *
 * Interface for `sequelize` query builders that are pageable.
 */
interface Pageable<Entity> {
  limit?: number;
  offset?: number;
}

/**
 * @internal
 *
 * Class that will convert a Query into a `sequelize` Query Builder.
 */
export class FilterQueryBuilder<Entity> {
  constructor(readonly whereBuilder: WhereBuilder<Entity> = new WhereBuilder<Entity>()) {}

  /**
   * Create a `sequelize` SelectQueryBuilder with `WHERE`, `ORDER BY` and `LIMIT/OFFSET` clauses.
   *
   * @param query - the query to apply.
   */
  findOptions(query: Query<Entity>): FindOptions {
    let opts: FindOptions = {};
    opts = this.applyFilter(opts, query.filter);
    opts = this.applySorting(opts, query.sorting);
    opts = this.applyPaging(opts, query.paging);
    return opts;
  }

  /**
   * Create a `sequelize` DeleteQueryBuilder with a WHERE clause.
   *
   * @param query - the query to apply.
   */
  destroyOptions(query: Query<Entity>): DestroyOptions {
    let opts: DestroyOptions = {};
    opts = this.applyFilter(opts, query.filter);
    opts = this.applyPaging(opts, query.paging);
    return opts;
  }

  /**
   * Create a `sequelize` UpdateQueryBuilder with `WHERE` and `ORDER BY` clauses
   *
   * @param query - the query to apply.
   */
  updateOptions(query: Query<Entity>): UpdateOptions {
    let opts: UpdateOptions = { where: {} };
    opts = this.applyFilter(opts, query.filter);
    opts = this.applyPaging(opts, query.paging);
    return opts;
  }

  /**
   * Applies paging to a Pageable `sequelize` query builder
   * @param qb - the `sequelize` QueryBuilder
   * @param paging - the Paging options.
   */
  applyPaging<P extends Pageable<Entity>>(qb: P, paging?: Paging): P {
    if (!paging) {
      return qb;
    }
    if (paging.limit !== undefined) {
      // eslint-disable-next-line no-param-reassign
      qb.limit = paging.limit;
    }
    if (paging.offset !== undefined) {
      // eslint-disable-next-line no-param-reassign
      qb.offset = paging.offset;
    }
    return qb;
  }

  /**
   * Applies the filter from a Query to a `sequelize` QueryBuilder.
   *
   * @param qb - the `sequelize` QueryBuilder.
   * @param filter - the filter.
   */
  applyFilter<Where extends Filterable>(filterable: Where, filter?: Filter<Entity>): Where {
    if (!filter) {
      return filterable;
    }
    // eslint-disable-next-line no-param-reassign
    filterable.where = this.whereBuilder.build(filter);
    return filterable;
  }

  /**
   * Applies the ORDER BY clause to a `sequelize` QueryBuilder.
   * @param qb - the `sequelize` QueryBuilder.
   * @param sorts - an array of SortFields to create the ORDER BY clause.
   */
  applySorting<T extends Sortable<Entity>>(qb: T, sorts?: SortField<Entity>[]): T {
    if (!sorts) {
      return qb;
    }
    // eslint-disable-next-line no-param-reassign
    qb.order = sorts.map(
      ({ field, direction, nulls }): OrderItem => {
        const col = `${field}`;
        const dir: string[] = [direction];
        if (nulls) {
          dir.push(nulls);
        }
        return [col, dir.join(' ')];
      },
    );
    return qb;
  }
}
