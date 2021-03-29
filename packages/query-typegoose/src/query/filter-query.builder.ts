import { AggregateQuery, Filter, Query, SortDirection, SortField } from '@nestjs-query/core';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { AggregateBuilder, TypegooseGroupAndAggregate } from './aggregate.builder';
import { getSchemaKey } from './helpers';
import { WhereBuilder } from './where.builder';

type TypegooseSort = Record<string, 'asc' | 'desc'>;

type TypegooseQuery<Entity> = {
  filterQuery: FilterQuery<new () => Entity>;
  options: { limit?: number; skip?: number; sort?: TypegooseSort[] };
};

type TypegooseAggregateQuery<Entity> = {
  filterQuery: FilterQuery<Entity>;
  aggregate: TypegooseGroupAndAggregate;
};
/**
 * @internal
 *
 * Class that will convert a Query into a `typeorm` Query Builder.
 */
export class FilterQueryBuilder<Entity> {
  constructor(
    readonly whereBuilder: WhereBuilder<Entity> = new WhereBuilder<Entity>(),
    readonly aggregateBuilder: AggregateBuilder<Entity> = new AggregateBuilder<Entity>(),
  ) {}

  buildQuery({ filter, paging, sorting }: Query<Entity>): TypegooseQuery<Entity> {
    return {
      filterQuery: this.buildFilterQuery(filter),
      options: { limit: paging?.limit, skip: paging?.offset, sort: this.buildSorting(sorting) },
    };
  }

  buildAggregateQuery(
    aggregate: AggregateQuery<DocumentType<Entity>>,
    filter?: Filter<Entity>,
  ): TypegooseAggregateQuery<Entity> {
    return {
      filterQuery: this.buildFilterQuery(filter),
      aggregate: this.aggregateBuilder.build(aggregate),
    };
  }

  buildIdAggregateQuery(
    id: unknown | unknown[],
    filter: Filter<Entity>,
    aggregate: AggregateQuery<Entity>,
  ): TypegooseAggregateQuery<Entity> {
    return {
      filterQuery: this.buildIdFilterQuery(id, filter),
      aggregate: this.aggregateBuilder.build(aggregate),
    };
  }

  buildIdFilterQuery(id: unknown | unknown[], filter?: Filter<Entity>): FilterQuery<new () => Entity> {
    return {
      ...this.buildFilterQuery(filter),
      _id: Array.isArray(id) ? { $in: id } : id,
    };
  }

  /**
   * Applies the filter from a Query to a `typeorm` QueryBuilder.
   *
   * @param filter - the filter.
   */
  buildFilterQuery(filter?: Filter<Entity>): FilterQuery<new () => Entity> {
    if (!filter) {
      return {};
    }
    return this.whereBuilder.build(filter);
  }

  /**
   * Applies the ORDER BY clause to a `typeorm` QueryBuilder.
   * @param sorts - an array of SortFields to create the ORDER BY clause.
   */
  buildSorting(sorts?: SortField<Entity>[]): TypegooseSort[] {
    return (sorts || []).map((sort) => ({
      [getSchemaKey(sort.field.toString())]: sort.direction === SortDirection.ASC ? 'asc' : 'desc',
    }));
  }
}
