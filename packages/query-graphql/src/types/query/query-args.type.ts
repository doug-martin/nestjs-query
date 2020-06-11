import { Class, Filter, Paging, Query, SortField } from '@nestjs-query/core';
import { ArgsType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { Validate, ValidateNested } from 'class-validator';
import { PropertyMax } from '../validators/property-max.validator';
import { FilterType } from './filter.type';
import {
  CursorPagingType,
  LimitOffsetPagingType,
  PagingTypes,
  StaticCursorPagingType,
  StaticLimitOffsetPagingType,
  StaticPagingTypes,
} from './paging';
import { PagingStrategies } from './paging/constants';
import { SortType } from './sorting.type';

export type QueryArgsTypeOpts<DTO> = {
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

  pagingStrategy?: PagingStrategies;
};

export interface StaticQueryArgsType<DTO, PagingType extends StaticPagingTypes> {
  SortType: Class<SortField<DTO>>;
  PageType: PagingType;
  FilterType: Class<Filter<DTO>>;
  new (): QueryArgsType<DTO, InstanceType<PagingType>>;
}

export interface QueryArgsType<DTO, PagingType extends PagingTypes> extends Query<DTO> {
  paging?: PagingType;
}

const defaultQueryOpts = {
  defaultResultSize: 10,
  maxResultsSize: 50,
  defaultSort: [],
  defaultFilter: {},
};

export type StaticCursorQueryArgsType<DTO> = StaticQueryArgsType<DTO, StaticCursorPagingType>;
export type CursorQueryArgsType<DTO> = QueryArgsType<DTO, CursorPagingType>;
export function CursorQueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: QueryArgsTypeOpts<DTO> = defaultQueryOpts,
): StaticQueryArgsType<DTO, StaticCursorPagingType> {
  const F = FilterType(DTOClass);
  const S = SortType(DTOClass);
  const P = CursorPagingType();

  @ArgsType()
  class QueryArgs implements CursorQueryArgsType<DTO> {
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
    filter?: Filter<DTO>;

    @Field(() => [S], {
      defaultValue: opts.defaultSort ?? defaultQueryOpts.defaultSort,
      description: 'Specify to sort results.',
    })
    @ValidateNested()
    @Type(() => S)
    sorting?: SortField<DTO>[];
  }
  return QueryArgs;
}

export type StaticLimitOffsetQueryArgsType<DTO> = StaticQueryArgsType<DTO, StaticLimitOffsetPagingType>;
export type LimitOffsetQueryArgsType<DTO> = QueryArgsType<DTO, LimitOffsetPagingType>;
export function LimitOffsetQueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: QueryArgsTypeOpts<DTO> = defaultQueryOpts,
): StaticLimitOffsetQueryArgsType<DTO> {
  const F = FilterType(DTOClass);
  const S = SortType(DTOClass);
  const P = LimitOffsetPagingType();

  @ArgsType()
  class QueryArgs implements LimitOffsetQueryArgsType<DTO> {
    static SortType = S;

    static FilterType = F;

    static PageType = P;

    @Field(() => P, {
      defaultValue: { limit: opts.defaultResultSize ?? defaultQueryOpts.defaultResultSize },
      description: 'Limit or page results.',
    })
    @ValidateNested()
    @Validate(PropertyMax, ['limit', opts.maxResultsSize ?? defaultQueryOpts.maxResultsSize])
    @Type(() => P)
    paging?: Paging;

    @Field(() => F, {
      defaultValue: opts.defaultFilter ?? defaultQueryOpts.defaultFilter,
      description: 'Specify to filter the records returned.',
    })
    @ValidateNested()
    @Type(() => F)
    filter?: Filter<DTO>;

    @Field(() => [S], {
      defaultValue: opts.defaultSort ?? defaultQueryOpts.defaultSort,
      description: 'Specify to sort results.',
    })
    @ValidateNested()
    @Type(() => S)
    sorting?: SortField<DTO>[];
  }
  return QueryArgs;
}

export function QueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: QueryArgsTypeOpts<DTO> & { pagingStrategy: PagingStrategies.LIMIT_OFFSET },
): StaticLimitOffsetQueryArgsType<DTO>;
export function QueryArgsType<DTO>(DTOClass: Class<DTO>, opts?: QueryArgsTypeOpts<DTO>): StaticCursorQueryArgsType<DTO>;
export function QueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: QueryArgsTypeOpts<DTO> = { ...defaultQueryOpts, pagingStrategy: PagingStrategies.CURSOR },
): StaticQueryArgsType<DTO, StaticPagingTypes> {
  if (opts.pagingStrategy === PagingStrategies.LIMIT_OFFSET) {
    return LimitOffsetQueryArgsType(DTOClass, opts);
  }
  return CursorQueryArgsType(DTOClass, opts);
}
