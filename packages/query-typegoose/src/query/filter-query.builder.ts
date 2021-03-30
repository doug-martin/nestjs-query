import { AggregateQuery, Filter, Query, SortDirection, SortField } from '@nestjs-query/core';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { AggregateBuilder, TypegooseGroupAndAggregate } from './aggregate.builder';
import { getSchemaKey } from './helpers';
import { WhereBuilder } from './where.builder';

const TYPEGOOSE_SORT_DIRECTION: Record<SortDirection, 1 | -1> = {
  [SortDirection.ASC]: 1,
  [SortDirection.DESC]: -1,
};
type TypegooseSort = Record<string, 1 | -1>;

type TypegooseQuery<Entity> = {
  filterQuery: FilterQuery<new () => Entity>;
  options: { limit?: number; skip?: number; sort?: TypegooseSort };
};

type TypegooseAggregateQuery<Entity> = TypegooseQuery<Entity> & {
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
      options: { sort: this.buildAggregateSorting(aggregate) },
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
      options: { sort: this.buildAggregateSorting(aggregate) },
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
  buildSorting(sorts?: SortField<Entity>[]): TypegooseSort | undefined {
    if (!sorts) {
      return undefined;
    }
    return sorts.reduce((sort: TypegooseSort, sortField: SortField<Entity>) => {
      const field = getSchemaKey(sortField.field.toString());
      const direction = TYPEGOOSE_SORT_DIRECTION[sortField.direction];
      return { ...sort, [field]: direction };
    }, {});
  }

  private buildAggregateSorting(aggregate: AggregateQuery<DocumentType<Entity>>): TypegooseSort | undefined {
    const aggregateGroupBy = this.aggregateBuilder.getGroupBySelects(aggregate.groupBy);
    if (!aggregateGroupBy) {
      return undefined;
    }
    return aggregateGroupBy.reduce((sort: TypegooseSort, sortField) => {
      return { ...sort, [getSchemaKey(sortField)]: TYPEGOOSE_SORT_DIRECTION[SortDirection.ASC] };
    }, {});
  }
}
