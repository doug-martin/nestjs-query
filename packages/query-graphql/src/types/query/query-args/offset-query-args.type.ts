import { ArgsType, Field } from '@nestjs/graphql'
import { Class, Filter, Query, SortField } from '@ptc-org/nestjs-query-core'
import { Type } from 'class-transformer'
import { Validate, ValidateNested } from 'class-validator'

import { SkipIf } from '../../../decorators'
import { getOrCreateOffsetConnectionType } from '../../connection'
import { PropertyMax } from '../../validators/property-max.validator'
import { FilterType } from '../filter.type'
import { getOrCreateOffsetPagingType, OffsetPagingType, PagingStrategies } from '../paging'
import { getOrCreateSortType } from '../sorting.type'
import { DEFAULT_QUERY_OPTS } from './constants'
import { OffsetQueryArgsTypeOpts, QueryType, StaticQueryType } from './interfaces'

export type OffsetQueryArgsType<DTO> = QueryType<DTO, PagingStrategies.OFFSET>

export function createOffsetQueryArgs<DTO>(
  DTOClass: Class<DTO>,
  opts: OffsetQueryArgsTypeOpts<DTO> = { ...DEFAULT_QUERY_OPTS, pagingStrategy: PagingStrategies.OFFSET }
): StaticQueryType<DTO, PagingStrategies.OFFSET> {
  const F = FilterType(DTOClass)
  const S = getOrCreateSortType(DTOClass)
  const C = getOrCreateOffsetConnectionType(DTOClass, opts)
  const P = getOrCreateOffsetPagingType()

  @ArgsType()
  class QueryArgs implements Query<DTO> {
    static SortType = S

    static FilterType = F

    static ConnectionType = C

    static PageType = P

    @Field(() => P, {
      defaultValue: { limit: opts.defaultResultSize ?? DEFAULT_QUERY_OPTS.defaultResultSize },
      description: 'Limit or page results.'
    })
    @ValidateNested()
    @Validate(PropertyMax, ['limit', opts.maxResultsSize ?? DEFAULT_QUERY_OPTS.maxResultsSize])
    @Type(() => P)
    paging?: OffsetPagingType

    @SkipIf(() => opts.disableFilter)
    @Field(() => F, {
      defaultValue: !F.hasRequiredFilters ? opts.defaultFilter ?? DEFAULT_QUERY_OPTS.defaultFilter : undefined,
      description: 'Specify to filter the records returned.',
      nullable: false
    })
    @ValidateNested()
    @Type(() => F)
    filter?: Filter<DTO> = opts.disableFilter ? opts.defaultFilter : undefined

    @SkipIf(() => opts.disableSort)
    @Field(() => [S], {
      defaultValue: opts.defaultSort ?? DEFAULT_QUERY_OPTS.defaultSort,
      description: 'Specify to sort results.'
    })
    @ValidateNested()
    @Type(() => S)
    sorting?: SortField<DTO>[] = opts.disableSort ? opts.defaultSort : undefined
  }

  return QueryArgs
}
