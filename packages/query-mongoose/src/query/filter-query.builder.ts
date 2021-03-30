import { AggregateQuery, Filter, Query, SortDirection, SortField } from '@nestjs-query/core';
import { FilterQuery, Document } from 'mongoose';
import { AggregateBuilder, MongooseGroupAndAggregate } from './aggregate.builder';
import { getSchemaKey } from './helpers';
import { WhereBuilder } from './where.builder';

const MONGOOSE_SORT_DIRECTION: Record<SortDirection, 1 | -1> = {
  [SortDirection.ASC]: 1,
  [SortDirection.DESC]: -1,
};

type MongooseSort = Record<string, 1 | -1>;
type MongooseQuery<Entity extends Document> = {
  filterQuery: FilterQuery<Entity>;
  options: { limit?: number; skip?: number; sort?: MongooseSort };
};

type MongooseAggregateQuery<Entity extends Document> = MongooseQuery<Entity> & {
  aggregate: MongooseGroupAndAggregate;
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

  buildAggregateQuery(aggregate: AggregateQuery<Entity>, filter?: Filter<Entity>): MongooseAggregateQuery<Entity> {
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
  ): MongooseAggregateQuery<Entity> {
    return {
      filterQuery: this.buildIdFilterQuery(id, filter),
      aggregate: this.aggregateBuilder.build(aggregate),
      options: { sort: this.buildAggregateSorting(aggregate) },
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
   * @param filter - the filter.
   */
  buildFilterQuery(filter?: Filter<Entity>): FilterQuery<Entity> {
    if (!filter) {
      return {};
    }
    return this.whereBuilder.build(filter);
  }

  /**
   * Applies the ORDER BY clause to a `typeorm` QueryBuilder.
   * @param sorts - an array of SortFields to create the ORDER BY clause.
   */
  buildSorting(sorts?: SortField<Entity>[]): MongooseSort | undefined {
    if (!sorts) {
      return undefined;
    }
    return sorts.reduce((sort: MongooseSort, sortField: SortField<Entity>) => {
      const field = getSchemaKey(sortField.field.toString());
      const direction = MONGOOSE_SORT_DIRECTION[sortField.direction];
      return { ...sort, [field]: direction };
    }, {});
  }

  private buildAggregateSorting(aggregate: AggregateQuery<Entity>): MongooseSort | undefined {
    const aggregateGroupBy = this.aggregateBuilder.getGroupBySelects(aggregate.groupBy);
    if (!aggregateGroupBy) {
      return undefined;
    }
    return aggregateGroupBy.reduce((sort: MongooseSort, sortField) => {
      return { ...sort, [getSchemaKey(sortField)]: MONGOOSE_SORT_DIRECTION[SortDirection.ASC] };
    }, {});
  }
}
