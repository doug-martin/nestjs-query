import { Class, Filter, Paging, Query, SortField } from '@nestjs-query/core';
import { ArgsType, Field } from '@nestjs/graphql';
import { ValidateNested, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyMax } from '../../validators/property-max.validator';
import { DEFAULT_QUERY_OPTS } from './constants';
import { QueryArgsTypeOpts, QueryType, StaticQueryType } from './interfaces';
import { OffsetPagingType, PagingStrategies, StaticOffsetPagingType } from '../paging';
import { FilterType } from '../filter.type';
import { SortType } from '../sorting.type';

export type StaticOffsetQueryArgsType<DTO> = StaticQueryType<DTO, StaticOffsetPagingType>;
export type OffsetQueryArgsType<DTO> = QueryType<DTO, OffsetPagingType>;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function OffsetQueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: QueryArgsTypeOpts<DTO> = { ...DEFAULT_QUERY_OPTS, pagingStrategy: PagingStrategies.OFFSET },
): StaticOffsetQueryArgsType<DTO> {
  const F = FilterType(DTOClass);
  const S = SortType(DTOClass);
  const P = OffsetPagingType();

  @ArgsType()
  class QueryArgs implements Query<DTO> {
    static SortType = S;

    static FilterType = F;

    static PageType = P;

    @Field(() => P, {
      defaultValue: { limit: opts.defaultResultSize ?? DEFAULT_QUERY_OPTS.defaultResultSize },
      description: 'Limit or page results.',
    })
    @ValidateNested()
    @Validate(PropertyMax, ['limit', opts.maxResultsSize ?? DEFAULT_QUERY_OPTS.maxResultsSize])
    @Type(() => P)
    paging?: Paging;

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
