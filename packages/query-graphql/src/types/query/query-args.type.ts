import { Class, Filter, Query, SortField } from '@nestjs-query/core';
import { ArgsType, Field } from '@nestjs/graphql';
import { ValidateNested, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyMax } from '../validators/property-max.validator';
import { FilterType } from './filter.type';
import { SortType } from './sorting.type';
import { CursorPagingType } from './paging.type';

export interface StaticQueryType<T> {
  SortType: Class<SortField<T>>;
  PageType: Class<CursorPagingType>;
  FilterType: Class<Filter<T>>;
  new (): QueryArgsType<T>;
}
export interface QueryArgsType<T> extends Query<T> {
  paging?: CursorPagingType;
}

export interface QueryArgsTypeOpts<T> {
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
  defaultSort?: SortField<T>[];
  /**
   * Default filter.
   * [Default=\{\}]
   */
  defaultFilter?: Filter<T>;
}

const defaultQueryOpts = { defaultResultSize: 10, maxResultsSize: 50, defaultSort: [], defaultFilter: {} };

export function QueryArgsType<T>(TClass: Class<T>, opts: QueryArgsTypeOpts<T> = defaultQueryOpts): StaticQueryType<T> {
  const F = FilterType(TClass);
  const S = SortType(TClass);
  const P = CursorPagingType();

  @ArgsType()
  class QueryArgs implements QueryArgsType<T> {
    static SortType = S;

    static FilterType = F;

    static PageType = P;

    @Field(() => P, {
      defaultValue: { first: opts.defaultResultSize ?? defaultQueryOpts.defaultResultSize },
      description: 'Limit or page results.',
    })
    @ValidateNested()
    @Validate(PropertyMax, ['first', opts.maxResultsSize ?? defaultQueryOpts.maxResultsSize])
    @Validate(PropertyMax, ['last', opts.maxResultsSize ?? defaultQueryOpts.maxResultsSize])
    @Type(() => P)
    paging?: CursorPagingType;

    @Field(() => F, {
      defaultValue: opts.defaultFilter ?? defaultQueryOpts.defaultFilter,
      description: 'Specify to filter the records returned.',
    })
    @ValidateNested()
    @Type(() => F)
    filter?: Filter<T>;

    @Field(() => [S], {
      defaultValue: opts.defaultSort ?? defaultQueryOpts.defaultSort,
      description: 'Specify to sort results.',
    })
    @ValidateNested()
    @Type(() => S)
    sorting?: SortField<T>[];
  }
  return QueryArgs;
}
