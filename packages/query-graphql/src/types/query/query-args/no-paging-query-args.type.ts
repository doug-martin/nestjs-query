import { Class, Filter, Query, SortField } from '@nestjs-query/core';
import { ArgsType, Field } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PagingStrategies } from '../paging';
import { DEFAULT_QUERY_OPTS } from './constants';
import { QueryArgsTypeOpts, QueryType, StaticQueryType } from './interfaces';
import { FilterType } from '../filter.type';
import { SortType } from '../sorting.type';

export type StaticNoPagingQueryArgsType<DTO> = StaticQueryType<DTO, never>;
export type NoPagingQueryArgsType<DTO> = QueryType<DTO, never>;
export function NoPagingQueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: QueryArgsTypeOpts<DTO> = { ...DEFAULT_QUERY_OPTS, pagingStrategy: PagingStrategies.NONE },
): StaticNoPagingQueryArgsType<DTO> {
  const F = FilterType(DTOClass);
  const S = SortType(DTOClass);
  @ArgsType()
  class QueryArgs implements Query<DTO> {
    static SortType = S;

    static FilterType = F;

    @Field(() => F, {
      defaultValue: !F.hasRequiredFilters ? opts.defaultFilter ?? DEFAULT_QUERY_OPTS.defaultFilter : undefined,
      description: 'Specify to filter the records returned.',
      nullable: false,
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
