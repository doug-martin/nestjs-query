import { Filter, Paging, Query, SortField, getFilterFields, AggregateQuery } from '@codeshine/nestjs-query-core';
import {
  DeleteQueryBuilder,
  QueryBuilder,
  Repository,
  SelectQueryBuilder,
  UpdateQueryBuilder,
  WhereExpression,
  EntityMetadata,
  ObjectLiteral,
} from 'typeorm';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import { AggregateBuilder } from './aggregate.builder';
import { WhereBuilder } from './where.builder';
import merge from 'lodash.merge';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';

/**
 * @internal
 *
 * Interface that for Typeorm query builders that are sortable.
 */
interface Sortable<Entity extends ObjectLiteral> extends QueryBuilder<Entity> {
  addOrderBy(sort: string, order?: 'ASC' | 'DESC', nulls?: 'NULLS FIRST' | 'NULLS LAST'): this;
}

interface Groupable<Entity extends ObjectLiteral> extends QueryBuilder<Entity> {
  addGroupBy(groupBy: string): this;
}

/**
 * @internal
 *
 * Interface for `typeorm` query builders that are pageable.
 */
interface Pageable<Entity extends ObjectLiteral> extends QueryBuilder<Entity> {
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
  metadata?: RelationMetadata;
  nested: {
    [keys: string]: NestedRecord<E>;
  };
}

/**
 * @internal
 *
 * Class that will convert a Query into a `typeorm` Query Builder.
 */
export class FilterQueryBuilder<Entity extends ObjectLiteral> {
  constructor(
    readonly repo: Repository<Entity>,
    readonly whereBuilder: WhereBuilder<Entity> = new WhereBuilder<Entity>(),
    readonly aggregateBuilder: AggregateBuilder<Entity> = new AggregateBuilder<Entity>(),
  ) {}

  /**
   * Create a `typeorm` SelectQueryBuilder with `WHERE`, `ORDER BY` and `LIMIT/OFFSET` clauses.
   *
   * @param query - the query to apply.
   */
  select(query: Query<Entity>): SelectQueryBuilder<Entity> {
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

  selectById(id: string | number | (string | number)[], query: Query<Entity>): SelectQueryBuilder<Entity> {
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

  aggregate(query: Query<Entity>, aggregate: AggregateQuery<Entity>): SelectQueryBuilder<Entity> {
    let qb = this.createQueryBuilder();
    qb = this.applyAggregate(qb, aggregate, qb.alias);
    qb = this.applyFilter(qb, query.filter, qb.alias);
    qb = this.applyAggregateSorting(qb, aggregate.groupBy, qb.alias);
    qb = this.applyGroupBy(qb, aggregate.groupBy, qb.alias);
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
   * Create a `typeorm` DeleteQueryBuilder with a WHERE clause.
   *
   * @param query - the query to apply.
   */
  softDelete(query: Query<Entity>): SoftDeleteQueryBuilder<Entity> {
    return this.applyFilter(
      this.repo.createQueryBuilder().softDelete() as SoftDeleteQueryBuilder<Entity>,
      query.filter,
    );
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
   * @param useSkipTake - if skip/take should be used instead of limit/offset.
   */
  applyPaging<P extends Pageable<Entity>>(qb: P, paging?: Paging, useSkipTake?: boolean): P {
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
  applyAggregate<Qb extends SelectQueryBuilder<Entity>>(qb: Qb, aggregate: AggregateQuery<Entity>, alias?: string): Qb {
    return this.aggregateBuilder.build(qb, aggregate, alias);
  }

  /**
   * Applies the filter from a Query to a `typeorm` QueryBuilder.
   *
   * @param qb - the `typeorm` QueryBuilder.
   * @param filter - the filter.
   * @param alias - optional alias to use to qualify an identifier
   */
  applyFilter<Where extends WhereExpression>(qb: Where, filter?: Filter<Entity>, alias?: string): Where {
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
  applySorting<T extends Sortable<Entity>>(qb: T, sorts?: SortField<Entity>[], alias?: string): T {
    if (!sorts) {
      return qb;
    }
    return sorts.reduce((prevQb, { field, direction, nulls }) => {
      const col = alias ? `${alias}.${field as string}` : `${field as string}`;
      return prevQb.addOrderBy(col, direction, nulls);
    }, qb);
  }

  applyGroupBy<T extends Groupable<Entity>>(qb: T, groupBy?: (keyof Entity)[], alias?: string): T {
    if (!groupBy) {
      return qb;
    }
    return groupBy.reduce((prevQb, group) => {
      const col = alias ? `${alias}.${group as string}` : `${group as string}`;
      return prevQb.addGroupBy(col);
    }, qb);
  }

  applyAggregateSorting<T extends Sortable<Entity>>(qb: T, groupBy?: (keyof Entity)[], alias?: string): T {
    if (!groupBy) {
      return qb;
    }
    return groupBy.reduce((prevQb, field) => {
      const col = alias ? `${alias}.${field as string}` : `${field as string}`;
      return prevQb.addOrderBy(col, 'ASC');
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
  applyRelationJoinsRecursive(
    qb: SelectQueryBuilder<Entity>,
    relationsMap?: NestedRecord,
    alias?: string,
  ): SelectQueryBuilder<Entity> {
    if (!relationsMap) {
      return qb;
    }
    const referencedRelations = Object.keys(relationsMap.nested);
    return referencedRelations.reduce((rqb, relation) => {
      return this.applyRelationJoinsRecursive(
        rqb.leftJoin(`${alias ?? rqb.alias}.${relation}`, relation),
        relationsMap.nested[relation],
        relation,
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
  filterHasRelations(filter?: Filter<Entity>): boolean {
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

  getReferencedRelationsRecursive(
    metadata: EntityMetadata,
    filter: Filter<unknown> = {},
    relationMetadata?: RelationMetadata,
  ): NestedRecord {
    const referencedFields = Array.from(new Set(Object.keys(filter) as (keyof Filter<unknown>)[]));
    return referencedFields.reduce(
      (prev, curr) => {
        const currFilterValue = filter[curr];

        if ((curr === 'and' || curr === 'or') && Array.isArray(currFilterValue)) {
          for (const subFilter of currFilterValue) {
            prev.nested = merge(prev.nested, this.getReferencedRelationsRecursive(metadata, subFilter).nested);
          }
        } else if ((curr === 'exists' || curr === 'notExists') && !Array.isArray(currFilterValue)) {
          prev.nested = merge(prev.nested, this.getReferencedRelationsRecursive(metadata, currFilterValue).nested);
        } else {
          const referencedRelation = metadata.relations.find((r) => r.propertyName === curr);

          if (!referencedRelation) return prev;

          prev.nested[curr] = merge(
            prev.nested[curr] || { metadata: referencedRelation },
            this.getReferencedRelationsRecursive(
              referencedRelation.inverseEntityMetadata,
              currFilterValue,
              referencedRelation,
            ),
          );
        }

        return prev;
      },
      { metadata: relationMetadata, nested: {} } as NestedRecord,
    );
  }

  private get relationNames(): string[] {
    return this.repo.metadata.relations.map((r) => r.propertyName);
  }
}
