import { Class, Filter, Query, SortField } from '@nestjs-query/core';
import { PagingStrategies, InferPagingTypeFromStrategy } from '../paging';
import { FilterTypeOptions } from '../filter.type';
import {
  ArrayConnectionOptions,
  CursorConnectionOptions,
  OffsetConnectionOptions,
  StaticConnectionType,
} from '../../connection';

export type BaseQueryArgsTypeOpts<DTO> = {
  /**
   * The default number of results to return.
   * [Default=10]
   */
  defaultResultSize?: number;
  /**
   * The maximum number of results that can be returned from a query.
   * [Default=50]
   */
  maxResultsSize?: number;
  /**
   * The default sort for queries.
   * [Default=[]]
   */
  defaultSort?: SortField<DTO>[];
  /**
   * Default filter.
   * [Default=\{\}]
   */
  defaultFilter?: Filter<DTO>;
} & FilterTypeOptions;

export interface CursorQueryArgsTypeOpts<DTO> extends BaseQueryArgsTypeOpts<DTO>, CursorConnectionOptions {
  pagingStrategy?: PagingStrategies.CURSOR;
}

export interface OffsetQueryArgsTypeOpts<DTO> extends BaseQueryArgsTypeOpts<DTO>, OffsetConnectionOptions {
  pagingStrategy: PagingStrategies.OFFSET;
}

export interface NonePagingQueryArgsTypeOpts<DTO> extends BaseQueryArgsTypeOpts<DTO>, ArrayConnectionOptions {
  pagingStrategy: PagingStrategies.NONE;
}

export type QueryArgsTypeOpts<DTO> =
  | CursorQueryArgsTypeOpts<DTO>
  | OffsetQueryArgsTypeOpts<DTO>
  | NonePagingQueryArgsTypeOpts<DTO>;

export interface StaticQueryType<DTO, PS extends PagingStrategies> extends Class<QueryType<DTO, PS>> {
  SortType: Class<SortField<DTO>>;
  PageType: Class<InferPagingTypeFromStrategy<PS>>;
  FilterType: Class<Filter<DTO>>;
  ConnectionType: StaticConnectionType<DTO, PS>;
}

export interface QueryType<DTO, PS extends PagingStrategies> extends Query<DTO> {
  paging?: InferPagingTypeFromStrategy<PS>;
}
