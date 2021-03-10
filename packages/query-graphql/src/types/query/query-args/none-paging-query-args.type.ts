import { Class, Filter, Query, SortField } from '@nestjs-query/core';
import { ArgsType, Field } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { getOrCreateArrayConnectionType } from '../../connection';
import { PagingStrategies, getOrCreateNonePagingType, NonePagingType } from '../paging';
import { DEFAULT_QUERY_OPTS } from './constants';
import { NonePagingQueryArgsTypeOpts, QueryType, StaticQueryType } from './interfaces';
import { FilterType } from '../filter.type';
import { getOrCreateSortType } from '../sorting.type';

export type NonePagingQueryArgsType<DTO> = QueryType<DTO, PagingStrategies.NONE>;
export function createNonePagingQueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: NonePagingQueryArgsTypeOpts<DTO> = { ...DEFAULT_QUERY_OPTS, pagingStrategy: PagingStrategies.NONE },
): StaticQueryType<DTO, PagingStrategies.NONE> {
  const F = FilterType(DTOClass);
  const S = getOrCreateSortType(DTOClass);
  const C = getOrCreateArrayConnectionType(DTOClass);
  const P = getOrCreateNonePagingType();

  @ArgsType()
  class QueryArgs implements Query<DTO> {
    static SortType = S;

    static FilterType = F;

    static PageType = P;

    static ConnectionType = C;

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

    paging?: NonePagingType;
  }
  return QueryArgs;
}
