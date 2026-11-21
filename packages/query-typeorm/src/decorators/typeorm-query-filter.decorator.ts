import { Class, ValueReflector } from '@nestjs-query/core';
import { Injectable } from '@nestjs/common';
import { TYPEORM_QUERY_FILTER_KEY } from './constants';
import { TypedClassDecorator } from './utils';
import { CustomFilter } from '../query';
import { ColumnType } from 'typeorm';

const reflector = new ValueReflector(TYPEORM_QUERY_FILTER_KEY);

export interface TypeOrmQueryFilterOpts {
  /**
   * Automatically register this filter on all available entities.
   * Default: true
   */
  autoRegister?: boolean;

  /**
   * Operations that this filters listens on
   */
  operations?: string[];

  /**
   * Typeorm database types this filters listens on
   */
  types?: ColumnType[];
}

/**
 * @internal
 */
export interface TypeOrmQueryFilterMetadata {
  filter: Class<CustomFilter>;
  autoRegister: boolean;
  operations?: string[];
  types?: ColumnType[];
}

const FilterList: Class<unknown>[] = [];
const FilterMeta: TypeOrmQueryFilterMetadata[] = [];

export function TypeOrmQueryFilter(opts: TypeOrmQueryFilterOpts = {}): TypedClassDecorator<CustomFilter> {
  return <Cls extends Class<CustomFilter>>(FilterClass: Cls): Cls | void => {
    FilterList.push(FilterClass);
    const meta: TypeOrmQueryFilterMetadata = {
      filter: FilterClass,
      autoRegister: opts.autoRegister ?? true,
      operations: opts.operations,
      types: opts.types,
    };
    reflector.set(FilterClass, meta);
    FilterMeta.push(meta);
    return Injectable()(FilterClass);
  };
}

/**
 * @internal
 */
export function getTypeOrmQueryFilters(): TypeOrmQueryFilterMetadata[] {
  return FilterMeta;
}
