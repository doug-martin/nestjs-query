import { AggregateQuery, Filter, Query, SortDirection, SortField } from '@nestjs-query/core';
import { FilterQuery, Document } from 'mongoose';
import { AggregateBuilder, MongooseAggregate } from './aggregate.builder';
import { getSchemaKey } from './helpers';
import { WhereBuilder } from './where.builder';

type MongooseSort = Record<string, 'asc' | 'desc'>;

type MongooseQuery<Entity extends Document> = {
  filterQuery: FilterQuery<Entity>;
  options: { limit?: number; skip?: number; sort?: MongooseSort[] };
};

type MongooseAggregateQuery<Entity extends Document> = {
  filterQuery: FilterQuery<Entity>;
  aggregate: MongooseAggregate;
};
/**
 * @internal
 *
 * Class that will convert a Query into a `typeorm` Query Builder.
 */
export class FilterQueryBuilder<Entity extends Document> {
  constructor(
    readonly whereBuilder: WhereBuilder<Entity> = new WhereBuilder<Entity>(),
    readonly aggregateBuilder: AggregateBuilder<Entity> = new AggregateBuilder<Entity>(),
  ) {}

  buildQuery({ filter, paging, sorting }: Query<Entity>): MongooseQuery<Entity> {
    return {
      filterQuery: this.buildFilterQuery(filter),
      options: { limit: paging?.limit, skip: paging?.offset, sort: this.buildSorting(sorting) },
    };
  }

  buildIdQuery(id: unknown | unknown[], { filter, paging, sorting }: Query<Entity>): MongooseQuery<Entity> {
    return {
      filterQuery: this.buildIdFilterQuery(id, filter),
      options: { limit: paging?.limit, skip: paging?.offset, sort: this.buildSorting(sorting) },
    };
  }

  buildAggregateQuery(aggregate: AggregateQuery<Entity>, filter?: Filter<Entity>): MongooseAggregateQuery<Entity> {
    return {
      filterQuery: this.buildFilterQuery(filter),
      aggregate: this.aggregateBuilder.build(aggregate),
    };
  }

  buildIdAggregateQuery(
    id: unknown | unknown[],
    filter: Filter<Entity>,
    aggregate: AggregateQuery<Entity>,
  ): MongooseAggregateQuery<Entity> {
    return {
      filterQuery: this.buildIdFilterQuery(id, filter),
      aggregate: this.aggregateBuilder.build(aggregate),
    };
  }

  buildIdFilterQuery(id: unknown | unknown[], filter?: Filter<Entity>): FilterQuery<Entity> {
    return {
      ...this.buildFilterQuery(filter),
      _id: Array.isArray(id) ? { $in: id } : id,
    };
  }

  /**
   * Applies the filter from a Query to a `typeorm` QueryBuilder.
   *
   * @param qb - the `typeorm` QueryBuilder.
   * @param filter - the filter.
   * @param alias - optional alias to use to qualify an identifier
   */
  buildFilterQuery(filter?: Filter<Entity>): FilterQuery<Entity> {
    if (!filter) {
      return {};
    }
    return this.whereBuilder.build(filter);
  }

  /**
   * Applies the ORDER BY clause to a `typeorm` QueryBuilder.
   * @param qb - the `typeorm` QueryBuilder.
   * @param sorts - an array of SortFields to create the ORDER BY clause.
   * @param alias - optional alias to use to qualify an identifier
   */
  buildSorting(sorts?: SortField<Entity>[], alias?: string): MongooseSort[] {
    return (sorts || []).map((sort) => ({
      [getSchemaKey(sort.field.toString())]: sort.direction === SortDirection.ASC ? 'asc' : 'desc',
    }));
  }
}
