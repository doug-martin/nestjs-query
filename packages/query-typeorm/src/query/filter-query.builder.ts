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

interface Sortable<Entity> extends QueryBuilder<Entity> {
  addOrderBy(sort: string, order?: 'ASC' | 'DESC', nulls?: 'NULLS FIRST' | 'NULLS LAST'): this;
}

interface Pageable<Entity> extends QueryBuilder<Entity> {
  limit(limit?: number): this;
  offset(offset?: number): this;
}

export class FilterQueryBuilder<Entity> extends AbstractQueryBuilder<Entity> {
  constructor(
    readonly repo: Repository<Entity>,
    readonly whereBuilder: WhereBuilder<Entity> = new WhereBuilder<Entity>(repo),
  ) {
    super(repo);
  }

  select(query: Query<Entity>): SelectQueryBuilder<Entity> {
    let qb = this.applyFilter(this.createQueryBuilder(), query.filter);
    qb = this.applySorting(qb, query.sorting);
    qb = this.applyPaging(qb, query.paging);
    return qb;
  }

  delete(query: Query<Entity>): DeleteQueryBuilder<Entity> {
    return this.applyFilter(this.repo.createQueryBuilder().delete(), query.filter);
  }

  update(query: Query<Entity>): UpdateQueryBuilder<Entity> {
    const qb = this.applyFilter(this.repo.createQueryBuilder().update(), query.filter);
    return this.applySorting(qb, query.sorting);
  }

  private applyPaging<P extends Pageable<Entity>>(qb: P, paging?: Paging): P {
    if (!paging) {
      return qb;
    }
    return qb.limit(paging.limit).offset(paging.offset);
  }

  private applyFilter<Where extends WhereExpression>(qb: Where, filter?: Filter<Entity>): Where {
    if (!filter) {
      return qb;
    }
    return this.whereBuilder.build(qb, filter);
  }

  private applySorting<T extends Sortable<Entity>>(qb: T, sorts?: SortField<Entity>[]): T {
    if (!sorts) {
      return qb;
    }
    return sorts.reduce((prevQb, { field, direction, nulls }) => {
      return prevQb.addOrderBy(this.fieldToDbCol(field), direction, nulls);
    }, qb);
  }

  private createQueryBuilder(): SelectQueryBuilder<Entity> {
    return this.repo.createQueryBuilder();
  }
}
