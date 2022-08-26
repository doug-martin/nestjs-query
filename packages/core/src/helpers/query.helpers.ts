import merge from 'lodash.merge'

import { Paging, Query, SortDirection, SortField, SortNulls } from '../interfaces'
import { applyFilter, mergeFilter, transformFilter } from './filter.helpers'
import { PageBuilder } from './page.builder'
import { SortBuilder } from './sort.builder'

export type QueryFieldMap<From, To, T extends keyof To = keyof To> = {
  [F in keyof From]?: T
}

export const transformSort = <From, To>(
  sorting: SortField<From>[] | undefined,
  fieldMap: QueryFieldMap<From, To>
): SortField<To>[] | undefined => {
  if (!sorting) {
    return undefined
  }
  return sorting.map((sf) => {
    const field = fieldMap[sf.field]
    if (!field) {
      throw new Error(`No corresponding field found for '${sf.field as string}' when transforming SortField`)
    }
    return { ...sf, field } as SortField<To>
  })
}

export const transformQuery = <From, To>(query: Query<From>, fieldMap: QueryFieldMap<From, To>): Query<To> => ({
  filter: transformFilter(query.filter, fieldMap),
  paging: query.paging,
  sorting: transformSort(query.sorting, fieldMap)
})

export const mergeQuery = <T>(base: Query<T>, source: Query<T>): Query<T> => {
  const { filter: baseFilter = {}, ...restBase } = base
  const { filter: sourceFilter = {}, ...restSource } = source

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return merge(restBase, restSource, { filter: mergeFilter(baseFilter, sourceFilter) }) as Query<T>
}

export const applySort = <DTO>(dtos: DTO[], sortFields: SortField<DTO>[]): DTO[] => SortBuilder.build(sortFields)(dtos)

export const applyPaging = <DTO>(dtos: DTO[], paging: Paging): DTO[] => PageBuilder.build<DTO>(paging)(dtos)

export const applyQuery = <DTO>(dtos: DTO[], query: Query<DTO>): DTO[] => {
  const filtered = applyFilter(dtos, query.filter ?? {})
  const sorted = applySort(filtered, query.sorting ?? [])
  return applyPaging(sorted, query.paging ?? {})
}

export function invertSort<DTO>(sortFields: SortField<DTO>[]): SortField<DTO>[] {
  return sortFields.map((sf) => {
    const direction = sf.direction === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC
    let nulls: SortNulls
    if (sf.nulls === SortNulls.NULLS_LAST) {
      nulls = SortNulls.NULLS_FIRST
    } else if (sf.nulls === SortNulls.NULLS_FIRST) {
      nulls = SortNulls.NULLS_LAST
    }
    return { ...sf, direction, nulls }
  })
}
