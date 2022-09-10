import { ArgsType, Field } from '@nestjs/graphql'
import { Class, Filter, Query, SortField } from '@ptc-org/nestjs-query-core'
import { Type } from 'class-transformer'
import { Validate, ValidateNested } from 'class-validator'

import { SkipIf } from '../../../decorators'
import { getOrCreateCursorConnectionType } from '../../connection'
import { PropertyMax } from '../../validators/property-max.validator'
import { FilterType } from '../filter.type'
import { CursorPagingType, getOrCreateCursorPagingType, PagingStrategies } from '../paging'
import { getOrCreateSortType } from '../sorting.type'
import { DEFAULT_QUERY_OPTS } from './constants'
import { CursorQueryArgsTypeOpts, QueryType, StaticQueryType } from './interfaces'

export type CursorQueryArgsType<DTO> = QueryType<DTO, PagingStrategies.CURSOR>

export function createCursorQueryArgsType<DTO>(
  DTOClass: Class<DTO>,
  opts: CursorQueryArgsTypeOpts<DTO> = { ...DEFAULT_QUERY_OPTS, pagingStrategy: PagingStrategies.CURSOR }
): StaticQueryType<DTO, PagingStrategies.CURSOR> {
  const F = FilterType(DTOClass)
  const S = getOrCreateSortType(DTOClass)
  const P = getOrCreateCursorPagingType()
  const C = getOrCreateCursorConnectionType(DTOClass, opts)

  @ArgsType()
  class QueryArgs implements Query<DTO> {
    static SortType = S

    static FilterType = F

    static PageType = P

    static ConnectionType = C

    @Field(() => P, {
      defaultValue: { first: opts.defaultResultSize ?? DEFAULT_QUERY_OPTS.defaultResultSize },
      description: 'Limit or page results.'
    })
    @ValidateNested()
    @Validate(PropertyMax, ['first', opts.maxResultsSize ?? DEFAULT_QUERY_OPTS.maxResultsSize])
    @Validate(PropertyMax, ['last', opts.maxResultsSize ?? DEFAULT_QUERY_OPTS.maxResultsSize])
    @Type(() => P)
    paging?: CursorPagingType

    @SkipIf(
      () => opts.disableFilter,
      Field(() => F, {
        defaultValue: !F.hasRequiredFilters ? opts.defaultFilter ?? DEFAULT_QUERY_OPTS.defaultFilter : undefined,
        description: 'Specify to filter the records returned.',
        nullable: false
      })
    )
    @ValidateNested()
    @Type(() => F)
    filter?: Filter<DTO> = opts.disableFilter ? opts.defaultFilter : undefined

    @SkipIf(
      () => opts.disableSort,
      Field(() => [S], {
        defaultValue: opts.defaultSort ?? DEFAULT_QUERY_OPTS.defaultSort,
        description: 'Specify to sort results.'
      })
    )
    @ValidateNested()
    @Type(() => S)
    sorting?: SortField<DTO>[] = opts.disableSort ? opts.defaultSort : undefined
  }

  return QueryArgs
}
