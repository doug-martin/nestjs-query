import { AggregateQuery, Filter, getFilterFields, Paging, Query, SortField } from '@nestjs-query/core';
import sequelize, {
  FindOptions,
  Filterable,
  DestroyOptions,
  Order,
  OrderItem,
  UpdateOptions,
  CountOptions,
  Association,
  Projectable,
  GroupOption,
} from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';
import { AggregateBuilder } from './aggregate.builder';
import { WhereBuilder } from './where.builder';

/**
 * @internal
 *
 * Interface that for `sequelize` query builders that are sortable.
 */
interface Sortable {
  order?: Order;
}

/**
 * @internal
 *
 * Interface for `sequelize` query builders that are pageable.
 */
interface Pageable {
  limit?: number;
  offset?: number;
}
interface Groupable {
  group?: GroupOption;
}

/**
 * @internal
 *
 * Class that will convert a Query into a `sequelize` Query Builder.
 */
export class FilterQueryBuilder<Entity extends Model<Entity, Partial<Entity>>> {
  constructor(
    readonly model: ModelCtor<Entity>,
    readonly whereBuilder: WhereBuilder<Entity> = new WhereBuilder<Entity>(),
    readonly aggregateBuilder: AggregateBuilder<Entity> = new AggregateBuilder<Entity>(model),
  ) {}

  /**
   * Create a `sequelize` SelectQueryBuilder with `WHERE`, `ORDER BY` and `LIMIT/OFFSET` clauses.
   *
   * @param query - the query to apply.
   */
  findOptions(query: Query<Entity>): FindOptions {
    let opts: FindOptions = this.applyAssociationIncludes({ subQuery: false }, query.filter);
    opts = this.applyFilter(opts, query.filter);
    opts = this.applySorting(opts, query.sorting);
    opts = this.applyPaging(opts, query.paging);
    return opts;
  }

  /**
   * Create a `sequelize` SelectQueryBuilder with `WHERE`, `ORDER BY` and `LIMIT/OFFSET` clauses.
   *
   * @param pk - The primary key(s) of records to find.
   * @param query - the query to apply.
   */
  findByIdOptions(pk: string | number | (string | number)[], query: Query<Entity>): FindOptions {
    let opts: FindOptions = this.applyAssociationIncludes({ subQuery: false }, query.filter);
    opts = this.applyFilter(opts, {
      ...(query.filter ?? ({} as Filter<Entity>)),
      [this.model.primaryKeyAttribute]: { [Array.isArray(pk) ? 'in' : 'eq']: pk },
    });
    opts = this.applySorting(opts, query.sorting);
    opts = this.applyPaging(opts, query.paging);
    return opts;
  }

  /**
   * Create a `sequelize` SelectQueryBuilder with `WHERE`, `ORDER BY` and `LIMIT/OFFSET` clauses.
   *
   * @param query - the query to apply.
   * @param aggregate - the aggregate query
   */
  aggregateOptions(query: Query<Entity>, aggregate: AggregateQuery<Entity>): FindOptions {
    let opts: FindOptions = { raw: true };
    opts = this.applyAggregate(opts, aggregate);
    opts = this.applyFilter(opts, query.filter);
    opts = this.applyAggregateSorting(opts, aggregate.groupBy);
    opts = this.applyGroupBy(opts, aggregate.groupBy);
    return opts;
  }

  relationAggregateOptions(query: Query<Entity>, aggregate: AggregateQuery<Entity>): FindOptions {
    // joinTableAttributes is used by many-to-many relations and must be empty.
    let opts: FindOptions = { joinTableAttributes: [], raw: true } as FindOptions;
    opts = this.applyAggregate(opts, aggregate);
    opts = this.applyFilter(opts, query.filter);
    opts = this.applyAggregateSorting(opts, aggregate.groupBy);
    opts = this.applyGroupBy(opts, aggregate.groupBy);
    return opts;
  }

  countOptions(query: Query<Entity>): CountOptions {
    let opts: CountOptions = this.applyAssociationIncludes({}, query.filter);
    opts.distinct = true;
    opts = this.applyFilter(opts, query.filter);
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
  updateOptions(query: Query<Entity>): UpdateOptions<Entity['_attributes']> {
    let opts: UpdateOptions<Entity> = { where: {} };
    opts = this.applyFilter(opts, query.filter);
    opts = this.applyPaging(opts, query.paging);
    return opts;
  }

  /**
   * Applies paging to a Pageable `sequelize` query builder
   * @param qb - the `sequelize` QueryBuilder
   * @param paging - the Paging options.
   */
  applyPaging<P extends Pageable>(qb: P, paging?: Paging): P {
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
   * @param filterable - the `sequelize` QueryBuilder.
   * @param filter - the filter.
   */
  applyFilter<Where extends Filterable>(filterable: Where, filter?: Filter<Entity>): Where {
    if (!filter) {
      return filterable;
    }
    // eslint-disable-next-line no-param-reassign
    filterable.where = this.whereBuilder.build(filter, this.getReferencedRelations(filter));
    return filterable;
  }

  /**
   * Applies the ORDER BY clause to a `sequelize` QueryBuilder.
   * @param qb - the `sequelize` QueryBuilder.
   * @param sorts - an array of SortFields to create the ORDER BY clause.
   */
  applySorting<T extends Sortable>(qb: T, sorts?: SortField<Entity>[]): T {
    if (!sorts) {
      return qb;
    }
    // eslint-disable-next-line no-param-reassign
    qb.order = sorts.map(({ field, direction, nulls }): OrderItem => {
      const col = `${field as string}`;
      const dir: string[] = [direction];
      if (nulls) {
        dir.push(nulls);
      }
      return [col, dir.join(' ')];
    });
    return qb;
  }

  private applyAggregate<P extends Projectable>(opts: P, aggregate: AggregateQuery<Entity>): P {
    // eslint-disable-next-line no-param-reassign
    opts.attributes = this.aggregateBuilder.build(aggregate).attributes;
    return opts;
  }

  applyGroupBy<T extends Groupable>(qb: T, groupBy?: (keyof Entity)[]): T {
    if (!groupBy) {
      return qb;
    }
    // eslint-disable-next-line no-param-reassign
    qb.group = groupBy.map((field) => {
      const colName = this.model.rawAttributes[field as string].field;
      return sequelize.col(colName ?? (field as string));
    });
    return qb;
  }

  applyAggregateSorting<T extends Sortable>(qb: T, groupBy?: (keyof Entity)[]): T {
    if (!groupBy) {
      return qb;
    }
    // eslint-disable-next-line no-param-reassign
    qb.order = groupBy.map((field): OrderItem => {
      const colName = this.model.rawAttributes[field as string].field;
      const col = sequelize.col(colName ?? (field as string));
      return [col, 'ASC'];
    });
    return qb;
  }

  private applyAssociationIncludes<Opts extends FindOptions | CountOptions>(
    findOpts: Opts,
    filter?: Filter<Entity>,
  ): Opts {
    if (!filter) {
      return findOpts;
    }
    const referencedRelations = this.getReferencedRelations(filter);
    return [...referencedRelations.values()].reduce((find, association) => {
      const { include = [] } = find;
      // eslint-disable-next-line no-param-reassign
      find.include = [...(Array.isArray(include) ? include : [include]), { association, attributes: [] }];
      return find;
    }, findOpts);
  }

  private getReferencedRelations(filter: Filter<Entity>): Map<string, Association> {
    const { relationNames } = this;
    const referencedFields = getFilterFields(filter);
    const referencedRelations = referencedFields.filter((f) => relationNames.includes(f));
    return referencedRelations.reduce(
      (map, r) => map.set(r, this.model.associations[r]),
      new Map<string, Association>(),
    );
  }

  private get relationNames(): string[] {
    return Object.keys(this.model.associations || {});
  }
}
