import { AggregateQuery, Filter, getFilterFields, Paging, Query, SortField } from '@ptc-org/nestjs-query-core';
import merge from 'lodash.merge';
import {
  DeleteQueryBuilder,
  EntityMetadata,
  QueryBuilder,
  Repository,
  SelectQueryBuilder,
  UpdateQueryBuilder,
  WhereExpressionBuilder
} from 'typeorm';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import { AggregateBuilder } from './aggregate.builder';
import { WhereBuilder } from './where.builder';

/**
 * @internal
 *
 * Interface that for Typeorm query builders that are sortable.
 */
interface Sortable<Entity> extends QueryBuilder<Entity> {
  addOrderBy(sort: string, order?: 'ASC' | 'DESC', nulls?: 'NULLS FIRST' | 'NULLS LAST'): this;
}

interface Groupable<Entity> extends QueryBuilder<Entity> {
  addGroupBy(groupBy: string): this;
}

/**
 * @internal
 *
 * Interface for `typeorm` query builders that are pageable.
 */
interface Pageable<Entity> extends QueryBuilder<Entity> {
  limit(limit?: number): this;

  offset(offset?: number): this;

  skip(skip?: number): this;

  take(take?: number): this;
}

/**
 * @internal
 *
 * Nested record type
 */
export interface NestedRecord<E = unknown> {
  [keys: string]: NestedRecord<E>;
}

/**
 * @internal
 *
 * Class that will convert a Query into a `typeorm` Query Builder.
 */
export class FilterQueryBuilder<Entity> {
  constructor(
    readonly repo: Repository<Entity>,
    readonly whereBuilder: WhereBuilder<Entity> = new WhereBuilder<Entity>(),
    readonly aggregateBuilder: AggregateBuilder<Entity> = new AggregateBuilder<Entity>(repo)
  ) {}

  /**
   * Create a `typeorm` SelectQueryBuilder with `WHERE`, `ORDER BY` and `LIMIT/OFFSET` clauses.
   *
   * @param query - the query to apply.
   */
  public select(query: Query<Entity>): SelectQueryBuilder<Entity> {
    const hasRelations = this.filterHasRelations(query.filter);
    let qb = this.createQueryBuilder();
    qb = hasRelations
      ? this.applyRelationJoinsRecursive(qb, this.getReferencedRelationsRecursive(this.repo.metadata, query.filter))
      : qb;
    qb = this.applyFilter(qb, query.filter, qb.alias);
    qb = this.applySorting(qb, query.sorting, qb.alias);
    qb = this.applyPaging(qb, query.paging, hasRelations);
    return qb;
  }

  public selectById(id: string | number | (string | number)[], query: Query<Entity>): SelectQueryBuilder<Entity> {
    const hasRelations = this.filterHasRelations(query.filter);
    let qb = this.createQueryBuilder();
    qb = hasRelations
      ? this.applyRelationJoinsRecursive(qb, this.getReferencedRelationsRecursive(this.repo.metadata, query.filter))
      : qb;
    qb = qb.andWhereInIds(id);
    qb = this.applyFilter(qb, query.filter, qb.alias);
    qb = this.applySorting(qb, query.sorting, qb.alias);
    qb = this.applyPaging(qb, query.paging, hasRelations);
    return qb;
  }

  public aggregate(query: Query<Entity>, aggregate: AggregateQuery<Entity>): SelectQueryBuilder<Entity> {
    const hasRelations = this.filterHasRelations(query.filter);
    let qb = this.createQueryBuilder();
    qb = hasRelations
      ? this.applyRelationJoinsRecursive(qb, this.getReferencedRelationsRecursive(this.repo.metadata, query.filter))
      : qb;
    qb = this.applyAggregate(qb, aggregate, qb.alias);
    qb = this.applyFilter(qb, query.filter, qb.alias);
    qb = this.applyAggregateSorting(qb, aggregate.groupBy, qb.alias);
    qb = this.applyAggregateGroupBy(qb, aggregate.groupBy, qb.alias);
    return qb;
  }

  /**
   * Create a `typeorm` DeleteQueryBuilder with a WHERE clause.
   *
   * @param query - the query to apply.
   */
  public delete(query: Query<Entity>): DeleteQueryBuilder<Entity> {
    return this.applyFilter(this.repo.createQueryBuilder().delete(), query.filter);
  }

  /**
   * Create a `typeorm` DeleteQueryBuilder with a WHERE clause.
   *
   * @param query - the query to apply.
   */
  public softDelete(query: Query<Entity>): SoftDeleteQueryBuilder<Entity> {
    return this.applyFilter(this.repo.createQueryBuilder().softDelete() as SoftDeleteQueryBuilder<Entity>, query.filter);
  }

  /**
   * Create a `typeorm` UpdateQueryBuilder with `WHERE` and `ORDER BY` clauses
   *
   * @param query - the query to apply.
   */
  public update(query: Query<Entity>): UpdateQueryBuilder<Entity> {
    const qb = this.applyFilter(this.repo.createQueryBuilder().update(), query.filter);
    return this.applySorting(qb, query.sorting);
  }

  /**
   * Applies paging to a Pageable `typeorm` query builder
   * @param qb - the `typeorm` QueryBuilder
   * @param paging - the Paging options.
   * @param useSkipTake - if skip/take should be used instead of limit/offset.
   */
  public applyPaging<P extends Pageable<Entity>>(qb: P, paging?: Paging, useSkipTake?: boolean): P {
    if (!paging) {
      return qb;
    }

    if (useSkipTake) {
      return qb.take(paging.limit).skip(paging.offset);
    }

    return qb.limit(paging.limit).offset(paging.offset);
  }

  /**
   * Applies the filter from a Query to a `typeorm` QueryBuilder.
   *
   * @param qb - the `typeorm` QueryBuilder.
   * @param aggregate - the aggregates to select.
   * @param alias - optional alias to use to qualify an identifier
   */
  public applyAggregate<Qb extends SelectQueryBuilder<Entity>>(qb: Qb, aggregate: AggregateQuery<Entity>, alias?: string): Qb {
    return this.aggregateBuilder.build(qb, aggregate, alias);
  }

  /**
   * Applies the filter from a Query to a `typeorm` QueryBuilder.
   *
   * @param qb - the `typeorm` QueryBuilder.
   * @param filter - the filter.
   * @param alias - optional alias to use to qualify an identifier
   */
  public applyFilter<Where extends WhereExpressionBuilder>(qb: Where, filter?: Filter<Entity>, alias?: string): Where {
    if (!filter) {
      return qb;
    }
    return this.whereBuilder.build(qb, filter, this.getReferencedRelationsRecursive(this.repo.metadata, filter), alias);
  }

  /**
   * Applies the ORDER BY clause to a `typeorm` QueryBuilder.
   * @param qb - the `typeorm` QueryBuilder.
   * @param sorts - an array of SortFields to create the ORDER BY clause.
   * @param alias - optional alias to use to qualify an identifier
   */
  public applySorting<T extends Sortable<Entity>>(qb: T, sorts?: SortField<Entity>[], alias?: string): T {
    if (!sorts) {
      return qb;
    }
    return sorts.reduce((prevQb, { field, direction, nulls }) => {
      const col = alias ? `${alias}.${field as string}` : `${field as string}`;
      return prevQb.addOrderBy(col, direction, nulls);
    }, qb);
  }

  public applyAggregateGroupBy<T extends Groupable<Entity>>(qb: T, groupBy?: (keyof Entity)[], alias?: string): T {
    if (!groupBy) {
      return qb;
    }
    return groupBy.reduce((prevQb, field) => {
      return prevQb.addGroupBy(this.aggregateBuilder.getCorrectedField(alias, field as string));
    }, qb);
  }

  public applyAggregateSorting<T extends Sortable<Entity>>(qb: T, groupBy?: (keyof Entity)[], alias?: string): T {
    if (!groupBy) {
      return qb;
    }
    return groupBy.reduce((prevQb, field) => {
      return prevQb.addOrderBy(this.aggregateBuilder.getCorrectedField(alias, field as string), 'ASC');
    }, qb);
  }

  /**
   * Create a `typeorm` SelectQueryBuilder which can be used as an entry point to create update, delete or insert
   * QueryBuilders.
   */
  private createQueryBuilder(): SelectQueryBuilder<Entity> {
    return this.repo.createQueryBuilder();
  }

  /**
   * Gets relations referenced in the filter and adds joins for them to the query builder
   * @param qb - the `typeorm` QueryBuilder.
   * @param relationsMap - the relations map.
   *
   * @returns the query builder for chaining
   */
  public applyRelationJoinsRecursive(
    qb: SelectQueryBuilder<Entity>,
    relationsMap?: NestedRecord,
    alias?: string
  ): SelectQueryBuilder<Entity> {
    if (!relationsMap) {
      return qb;
    }
    const referencedRelations = Object.keys(relationsMap);
    return referencedRelations.reduce((rqb, relation) => {
      return this.applyRelationJoinsRecursive(
        rqb.leftJoin(`${alias ?? rqb.alias}.${relation}`, relation),
        relationsMap[relation],
        relation
      );
    }, qb);
  }

  /**
   * Checks if a filter references any relations.
   * @param filter
   * @private
   *
   * @returns true if there are any referenced relations
   */
  public filterHasRelations(filter?: Filter<Entity>): boolean {
    if (!filter) {
      return false;
    }
    return this.getReferencedRelations(filter).length > 0;
  }

  private getReferencedRelations(filter: Filter<Entity>): string[] {
    const { relationNames } = this;
    const referencedFields = getFilterFields(filter);
    return referencedFields.filter((f) => relationNames.includes(f));
  }

  getReferencedRelationsRecursive(metadata: EntityMetadata, filter: Filter<unknown> = {}): NestedRecord {
    const referencedFields = Array.from(new Set(Object.keys(filter) as (keyof Filter<unknown>)[]));
    return referencedFields.reduce((prev, curr) => {
      const currFilterValue = filter[curr];
      if ((curr === 'and' || curr === 'or') && currFilterValue) {
        for (const subFilter of currFilterValue) {
          prev = merge(prev, this.getReferencedRelationsRecursive(metadata, subFilter));
        }
      }
      const referencedRelation = metadata.relations.find((r) => r.propertyName === curr);
      if (!referencedRelation) return prev;
      return {
        ...prev,
        [curr]: merge(
          (prev as NestedRecord)[curr],
          this.getReferencedRelationsRecursive(referencedRelation.inverseEntityMetadata, currFilterValue)
        )
      };
    }, {});
  }

  private get relationNames(): string[] {
    return this.repo.metadata.relations.map((r) => r.propertyName);
  }
}
