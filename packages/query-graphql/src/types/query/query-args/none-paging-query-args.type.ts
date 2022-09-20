import { ArgsType, Field } from '@nestjs/graphql'
import { Class, Filter, Query, SortField } from '@ptc-org/nestjs-query-core'
import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'

import { SkipIf } from '../../../decorators'
import { getOrCreateArrayConnectionType } from '../../connection'
import { FilterType } from '../filter.type'
import { getOrCreateNonePagingType, NonePagingType, PagingStrategies } from '../paging'
import { getOrCreateSortType } from '../sorting.type'
import { DEFAULT_QUERY_OPTS } from './constants'
import { NonePagingQueryArgsTypeOpts, QueryType, StaticQueryType } from './interfaces'

export type NonePagingQueryArgsType<DTO> = QueryType<DTO, PagingStrategies.NONE>

export function createNonePagingQueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: NonePagingQueryArgsTypeOpts<DTO> = { ...DEFAULT_QUERY_OPTS, pagingStrategy: PagingStrategies.NONE }
): StaticQueryType<DTO, PagingStrategies.NONE> {
  const F = FilterType(DTOClass)
  const S = getOrCreateSortType(DTOClass)
  const C = getOrCreateArrayConnectionType(DTOClass)
  const P = getOrCreateNonePagingType()

  @ArgsType()
  class QueryArgs implements Query<DTO> {
    static SortType = S

    static FilterType = F

    static PageType = P

    static ConnectionType = C

    @SkipIf(
      () => opts.disableFilter,
      Field(() => F, {
        defaultValue: !F.hasRequiredFilters ? opts.defaultFilter ?? DEFAULT_QUERY_OPTS.defaultFilter : undefined,
        description: 'Specify to filter the records returned.',
        nullable: false
      }),
      ValidateNested(),
      Type(() => F)
    )
    filter?: Filter<DTO> = opts.disableFilter ? opts.defaultFilter : undefined

    @SkipIf(
      () => opts.disableSort,
      Field(() => [S], {
        defaultValue: opts.defaultSort ?? DEFAULT_QUERY_OPTS.defaultSort,
        description: 'Specify to sort results.'
      }),
      ValidateNested(),
      Type(() => S)
    )
    sorting?: SortField<DTO>[] = opts.disableSort ? opts.defaultSort : undefined

    paging?: NonePagingType
  }

  return QueryArgs
}
