import { Class, Filter, Query, SortField } from '@nestjs-query/core';
import { ArgsType, Field } from '@nestjs/graphql';
import { ValidateNested, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyMax } from '../../validators/property-max.validator';
import { DEFAULT_QUERY_OPTS } from './constants';
import { QueryArgsTypeOpts, QueryType, StaticQueryType } from './interfaces';
import { StaticCursorPagingType, CursorPagingType, PagingStrategies } from '../paging';
import { FilterType } from '../filter.type';
import { SortType } from '../sorting.type';

export type StaticCursorQueryArgsType<DTO> = StaticQueryType<DTO, StaticCursorPagingType>;
export type CursorQueryArgsType<DTO> = QueryType<DTO, CursorPagingType>;
export function CursorQueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: QueryArgsTypeOpts<DTO> = { ...DEFAULT_QUERY_OPTS, pagingStrategy: PagingStrategies.CURSOR },
): StaticCursorQueryArgsType<DTO> {
  const F = FilterType(DTOClass);
  const S = SortType(DTOClass);
  const P = CursorPagingType();

  @ArgsType()
  class QueryArgs implements Query<DTO> {
    static SortType = S;

    static FilterType = F;

    static PageType = P;

    @Field(() => P, {
      defaultValue: { first: opts.defaultResultSize ?? DEFAULT_QUERY_OPTS.defaultResultSize },
      description: 'Limit or page results.',
    })
    @ValidateNested()
    @Validate(PropertyMax, ['first', opts.maxResultsSize ?? DEFAULT_QUERY_OPTS.maxResultsSize])
    @Validate(PropertyMax, ['last', opts.maxResultsSize ?? DEFAULT_QUERY_OPTS.maxResultsSize])
    @Type(() => P)
    paging?: CursorPagingType;

    @Field(() => F, {
      defaultValue: opts.defaultFilter ?? DEFAULT_QUERY_OPTS.defaultFilter,
      description: 'Specify to filter the records returned.',
    })
    @ValidateNested()
    @Type(() => F)
    filter?: Filter<DTO>;

    @Field(() => [S], {
      defaultValue: opts.defaultSort ?? DEFAULT_QUERY_OPTS.defaultSort,
      description: 'Specify to sort results.',
    })
    @ValidateNested()
    @Type(() => S)
    sorting?: SortField<DTO>[];
  }
  return QueryArgs;
}
