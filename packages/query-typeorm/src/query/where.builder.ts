import { Class, Filter, FilterComparisons, FilterFieldComparison } from '@nestjs-query/core';
import { Brackets, WhereExpression } from 'typeorm';
import { QueryTypeormMetadata } from '../common';
import { CustomFilterContext, CustomFilterRegistry } from './custom-filter.registry';
import { RelationsMeta } from './filter-query.builder';
import { EntityComparisonField, SQLComparisonBuilder } from './sql-comparison.builder';

interface WhereBuilderOpts<Entity> {
  sqlComparisonBuilder?: SQLComparisonBuilder<Entity>;
  customFilterRegistry?: CustomFilterRegistry;
  queryTypeormMetadata?: QueryTypeormMetadata;
}

/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
export class WhereBuilder<Entity> {
  private sqlComparisonBuilder: SQLComparisonBuilder<Entity>;

  private customFilterRegistry: CustomFilterRegistry;

  // prettier-ignore
  constructor(
    private queryTypeormMetadata: QueryTypeormMetadata,
    opts?: WhereBuilderOpts<Entity>
  ) {
    this.sqlComparisonBuilder = opts?.sqlComparisonBuilder ?? new SQLComparisonBuilder<Entity>();
    this.customFilterRegistry = opts?.customFilterRegistry ?? new CustomFilterRegistry();
  }

  /**
   * Builds a WHERE clause from a Filter.
   * @param where - the `typeorm` WhereExpression
   * @param filter - the filter to build the WHERE clause from.
   * @param relationMeta - the relations tree.
   * @param klass - the class currently being processed
   * @param alias - optional alias to use to qualify an identifier
   */
  build<Where extends WhereExpression>(
    where: Where,
    filter: Filter<Entity>,
    relationMeta: RelationsMeta,
    klass: Class<Entity>,
    alias?: string,
  ): Where {
    const { and, or } = filter;
    if (and && and.length) {
      this.filterAnd(where, and, relationMeta, klass, alias);
    }
    if (or && or.length) {
      this.filterOr(where, or, relationMeta, klass, alias);
    }
    return this.filterFields(where, filter, relationMeta, klass, alias);
  }

  /**
   * ANDs multiple filters together. This will properly group every clause to ensure proper precedence.
   *
   * @param where - the `typeorm` WhereExpression
   * @param filters - the array of filters to AND together
   * @param relationMeta - the relations tree.
   * @param klass - the class currently being processed
   * @param alias - optional alias to use to qualify an identifier
   */
  private filterAnd<Where extends WhereExpression>(
    where: Where,
    filters: Filter<Entity>[],
    relationMeta: RelationsMeta,
    klass: Class<Entity>,
    alias?: string,
  ): Where {
    return where.andWhere(
      new Brackets((qb) =>
        filters.reduce((w, f) => qb.andWhere(this.createBrackets(f, relationMeta, klass, alias)), qb),
      ),
    );
  }

  /**
   * ORs multiple filters together. This will properly group every clause to ensure proper precedence.
   *
   * @param where - the `typeorm` WhereExpression
   * @param filter - the array of filters to OR together
   * @param relationMeta - the relations tree.
   * @param klass - the class currently being processed
   * @param alias - optional alias to use to qualify an identifier
   */
  private filterOr<Where extends WhereExpression>(
    where: Where,
    filter: Filter<Entity>[],
    relationMeta: RelationsMeta,
    klass: Class<Entity>,
    alias?: string,
  ): Where {
    return where.andWhere(
      new Brackets((qb) => filter.reduce((w, f) => qb.orWhere(this.createBrackets(f, relationMeta, klass, alias)), qb)),
    );
  }

  /**
   * Wraps a filter in brackes to ensure precedence.
   * ```
   * {a: { eq: 1 } } // "(a = 1)"
   * {a: { eq: 1 }, b: { gt: 2 } } // "((a = 1) AND (b > 2))"
   * ```
   * @param filter - the filter to wrap in brackets.
   * @param relationMeta - the relations tree.
   * @param klass - the class currently being processed
   * @param alias - optional alias to use to qualify an identifier
   */
  private createBrackets(
    filter: Filter<Entity>,
    relationMeta: RelationsMeta,
    klass: Class<Entity>,
    alias?: string,
  ): Brackets {
    return new Brackets((qb) => this.build(qb, filter, relationMeta, klass, alias));
  }

  /**
   * Creates field comparisons from a filter. This method will ignore and/or properties.
   * @param where - the `typeorm` WhereExpression
   * @param filter - the filter with fields to create comparisons for.
   * @param relationMeta - the relations tree.
   * @param klass - the class currently being processed
   * @param alias - optional alias to use to qualify an identifier
   */
  private filterFields<Where extends WhereExpression>(
    where: Where,
    filter: Filter<Entity>,
    relationMeta: RelationsMeta,
    klass: Class<Entity>,
    alias?: string,
  ): Where {
    return Object.keys(filter).reduce((w, field) => {
      if (field !== 'and' && field !== 'or') {
        return this.withFilterComparison(
          where,
          field as keyof Entity & string,
          this.getField(filter, field as keyof Entity),
          relationMeta,
          klass,
          alias,
        );
      }
      return w;
    }, where);
  }

  private getField<K extends keyof FilterComparisons<Entity>>(
    obj: FilterComparisons<Entity>,
    field: K,
  ): FilterFieldComparison<Entity[K]> {
    return obj[field] as FilterFieldComparison<Entity[K]>;
  }

  private withFilterComparison<T extends keyof Entity, Where extends WhereExpression>(
    where: Where,
    field: T & string,
    cmp: FilterFieldComparison<Entity[T]>,
    relationMeta: RelationsMeta,
    klass: Class<Entity>,
    alias?: string,
  ): Where {
    if (relationMeta && relationMeta[field as string]) {
      return this.withRelationFilter(
        where,
        field,
        cmp as Filter<Entity[T]>,
        relationMeta[field as string].relations,
        relationMeta[field as string].targetKlass,
      );
    }
    // This could be null if we are targeting a virtual field for special (class, field, operation) filters
    const fieldMeta = this.queryTypeormMetadata.get(klass)?.[field];
    return where.andWhere(
      new Brackets((qb) => {
        const opts = Object.keys(cmp) as (keyof FilterFieldComparison<Entity[T]> & string)[];
        const sqlComparisons = opts.map((cmpType) => {
          // If we have a registered customfilter, this has priority over the standard sqlComparisonBuilder
          if (!fieldMeta || fieldMeta.metaType === 'property') {
            const customFilter = this.customFilterRegistry?.getFilter(cmpType, fieldMeta?.type, klass, field);
            if (customFilter) {
              const context: CustomFilterContext = {
                fieldType: fieldMeta?.type,
              };
              return customFilter.apply(field, cmpType, cmp[cmpType], alias, context);
            }
          }
          // Fallback to sqlComparisonBuilder
          return this.sqlComparisonBuilder.build(
            field,
            cmpType,
            cmp[cmpType] as EntityComparisonField<Entity, T>,
            alias,
          );
        });
        sqlComparisons.map(({ sql, params }) => {
          qb.orWhere(sql, params);
        });
      }),
    );
  }

  private withRelationFilter<T extends keyof Entity, Where extends WhereExpression>(
    where: Where,
    field: T,
    cmp: Filter<Entity[T]>,
    relationMeta: RelationsMeta,
    klass: Class<Entity[T]>,
  ): Where {
    return where.andWhere(
      new Brackets((qb) => {
        // const relationWhere = new WhereBuilder<Entity[T]>({
        //   customFilterRegistry: this.customFilterRegistry,
        //   sqlComparisonBuilder: this.sqlComparisonBuilder,
        // });
        // return relationWhere.build(qb, cmp, relationMeta, klass, field as string);
        // No need to create a new builder since we are stateless and we can reuse the same instance
        return (this as unknown as WhereBuilder<Entity[T]>).build(qb, cmp, relationMeta, klass, field as string);
      }),
    );
  }
}
