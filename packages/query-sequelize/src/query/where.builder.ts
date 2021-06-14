import { WhereOptions, Op, Association } from 'sequelize';
import { Filter, FilterComparisons, FilterFieldComparison } from '@nestjs-query/core';
import { EntityComparisonField, SQLComparisonBuilder } from './sql-comparison.builder';

/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
export class WhereBuilder<Entity> {
  constructor(readonly sqlComparisonBuilder: SQLComparisonBuilder<Entity> = new SQLComparisonBuilder<Entity>()) {}

  /**
   * Builds a WHERE clause from a Filter.
   * @param filter - the filter to build the WHERE clause from.
   * @param associations - map of associations that are included in the query.
   */
  build(filter: Filter<Entity>, associations: Map<string, Association>, alias?: string): WhereOptions {
    const { and, or } = filter;
    let ands: WhereOptions[] = [];
    let ors: WhereOptions[] = [];
    let whereOpts: WhereOptions = {};
    if (and && and.length) {
      ands = and.map((f) => this.build(f, associations, alias));
    }
    if (or && or.length) {
      ors = or.map((f) => this.build(f, associations, alias));
    }
    const filterAnds = this.filterFields(filter, associations, alias);
    if (filterAnds) {
      ands = [...ands, filterAnds];
    }
    if (ands.length) {
      whereOpts = { ...whereOpts, [Op.and]: ands };
    }
    if (ors.length) {
      whereOpts = { ...whereOpts, [Op.or]: ors };
    }
    return whereOpts;
  }

  /**
   * Creates field comparisons from a filter. This method will ignore and/or properties.
   * @param filter - the filter with fields to create comparisons for.
   */
  private filterFields(
    filter: Filter<Entity>,
    associations: Map<string, Association>,
    alias?: string,
  ): WhereOptions | undefined {
    const ands = Object.keys(filter)
      .filter((f) => f !== 'and' && f !== 'or')
      .map((field) =>
        this.withFilterComparison(
          field as keyof Entity,
          this.getField(filter, field as keyof Entity),
          associations,
          alias,
        ),
      );
    if (ands.length === 1) {
      return ands[0];
    }
    if (ands.length) {
      return { [Op.and]: ands };
    }
    return undefined;
  }

  private getField<K extends keyof FilterComparisons<Entity>>(
    obj: FilterComparisons<Entity>,
    field: K,
  ): FilterFieldComparison<Entity[K]> {
    return obj[field] as FilterFieldComparison<Entity[K]>;
  }

  private withFilterComparison<T extends keyof Entity>(
    field: T,
    cmp: FilterFieldComparison<Entity[T]>,
    associations: Map<string, Association>,
    alias?: string,
  ): WhereOptions {
    if (associations.has(field as string)) {
      const wb = new WhereBuilder<Entity[T]>();
      return wb.build(cmp as unknown as Filter<Entity[T]>, associations, field as string);
    }
    let colName = field;
    if (alias && associations.has(alias)) {
      colName = (associations.get(alias)?.target.rawAttributes[colName as string]?.field ?? colName) as T;
    }
    const opts = Object.keys(cmp) as (keyof FilterFieldComparison<Entity[T]>)[];
    if (opts.length === 1) {
      const cmpType = opts[0];
      return this.sqlComparisonBuilder.build(colName, cmpType, cmp[cmpType] as EntityComparisonField<Entity, T>, alias);
    }
    return {
      [Op.or]: opts.map((cmpType) =>
        this.sqlComparisonBuilder.build(colName, cmpType, cmp[cmpType] as EntityComparisonField<Entity, T>, alias),
      ),
    };
  }
}
