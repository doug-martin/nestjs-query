import { Filter, FilterComparisons, FilterFieldComparison } from '../interfaces'
import { FilterBuilder } from './filter.builder'
import { QueryFieldMap } from './query.helpers'

export type LikeComparisonOperators = 'like' | 'notLike' | 'iLike' | 'notILike'
export type InComparisonOperators = 'in' | 'notIn'
export type BetweenComparisonOperators = 'between' | 'notBetween'
export type RangeComparisonOperators = 'gt' | 'gte' | 'lt' | 'lte'
export type BooleanComparisonOperators = 'eq' | 'neq' | 'is' | 'isNot'

export const isLikeComparisonOperator = (op: unknown): op is LikeComparisonOperators =>
  op === 'like' || op === 'notLike' || op === 'iLike' || op === 'notILike'

export const isInComparisonOperators = (op: unknown): op is InComparisonOperators => op === 'in' || op === 'notIn'

export const isBetweenComparisonOperators = (op: unknown): op is BetweenComparisonOperators =>
  op === 'between' || op === 'notBetween'

export const isRangeComparisonOperators = (op: unknown): op is RangeComparisonOperators =>
  op === 'gt' || op === 'gte' || op === 'lt' || op === 'lte'

export const isBooleanComparisonOperators = (op: unknown): op is BooleanComparisonOperators =>
  op === 'eq' || op === 'neq' || op === 'is' || op === 'isNot'

export const isComparison = <DTO, K extends keyof DTO>(
  maybeComparison?: FilterFieldComparison<DTO[K]> | Filter<DTO[K]>
): maybeComparison is FilterFieldComparison<DTO[K]> => {
  if (!maybeComparison) {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.keys(maybeComparison as Record<string, unknown>).every(
    (op) =>
      isLikeComparisonOperator(op) ||
      isInComparisonOperators(op) ||
      isBetweenComparisonOperators(op) ||
      isRangeComparisonOperators(op) ||
      isBooleanComparisonOperators(op)
  )
}

// TODO: test
export const getFilterFieldComparison = <DTO, K extends keyof FilterComparisons<DTO>>(
  obj: FilterComparisons<DTO>,
  field: K
): FilterFieldComparison<DTO[K]> & Filter<DTO[K]> => obj[field] as FilterFieldComparison<DTO[K]> & Filter<DTO[K]>

export const transformFilter = <From, To>(
  filter: Filter<From> | undefined,
  fieldMap: QueryFieldMap<From, To>
): Filter<To> | undefined => {
  if (!filter) {
    return undefined
  }
  return Object.keys(filter).reduce((newFilter, filterField) => {
    if (filterField === 'and' || filterField === 'or') {
      return { ...newFilter, [filterField]: filter[filterField]?.map((f) => transformFilter(f, fieldMap)) }
    }
    const fromField = filterField as keyof From
    const otherKey = fieldMap[fromField]
    if (!otherKey) {
      throw new Error(`No corresponding field found for '${filterField}' when transforming Filter`)
    }
    return { ...newFilter, [otherKey as string]: filter[fromField] }
  }, {} as Filter<To>)
}

export const mergeFilter = <T>(base: Filter<T>, source: Filter<T>): Filter<T> => {
  if (!Object.keys(base).length) {
    return source
  }
  if (!Object.keys(source).length) {
    return base
  }
  return { and: [source, base] } as Filter<T>
}

export const getFilterFields = <DTO>(filter: Filter<DTO>): string[] => {
  const fieldSet: Set<string> = Object.keys(filter).reduce((fields: Set<string>, filterField: string): Set<string> => {
    if (filterField === 'and' || filterField === 'or') {
      const andOrFilters = filter[filterField]

      if (andOrFilters !== undefined) {
        return andOrFilters.reduce(
          (andOrFields, andOrFilter) => new Set<string>([...andOrFields, ...getFilterFields(andOrFilter)]),
          fields
        )
      }
    } else {
      fields.add(filterField)
    }

    return fields
  }, new Set<string>())

  return [...fieldSet]
}

export const getFilterComparisons = <DTO, K extends keyof FilterComparisons<DTO>>(
  filter: Filter<DTO>,
  key: K
): FilterFieldComparison<DTO[K]>[] => {
  const results: FilterFieldComparison<DTO[K]>[] = []

  if (filter.and || filter.or) {
    const filters = [...(filter.and ?? []), ...(filter.or ?? [])]
    filters.forEach((f) => getFilterComparisons(f, key).forEach((comparison) => results.push(comparison)))
  }

  const comparison = getFilterFieldComparison(filter as FilterComparisons<DTO>, key)
  if (isComparison(comparison)) {
    results.push(comparison)
  }

  return [...results]
}

/*
getFilterComparisons only returns the first layer, this one will return everything, it only returns the same
item multiple times, that needs to be fixed first
 */
// export const getDeepFilterComparisons = <DTO, K extends keyof FilterComparisons<DTO>>(
//   filter: Filter<DTO>,
//   key: K
// ): FilterFieldComparison<DTO[K]>[] => {
//   let results: FilterFieldComparison<DTO[K]>[] = [];
//
//   const comparison = getFilterFieldComparison(filter as FilterComparisons<DTO>, key);
//   if (isComparison(comparison)) {
//     results.push(comparison);
//
//   } else if (Array.isArray(filter)) {
//     filter.forEach((f: Filter<DTO>) => {
//       results = results.concat(getFilterComparisons(f, key));
//     });
//   }
//
//   if (typeof filter === 'object') {
//     Object.keys(filter).forEach((subFilterKey) => {
//       const subFilter = filter[subFilterKey] as FilterFieldComparison<DTO[K]>;
//
//       if (subFilterKey === key) {
//         results.push(subFilter);
//       } else {
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         results = results.concat(getFilterComparisons(subFilter, key));
//       }
//     });
//   }
//
//   return [...results];
// };

export const getFilterOmitting = <DTO>(filter: Filter<DTO>, ...keys: (keyof Filter<DTO>)[]): Filter<DTO> =>
  Object.keys(filter).reduce<Filter<DTO>>((f, next) => {
    const omitted = { ...f }
    const k = next as keyof Filter<DTO>

    if (k === 'and' && filter.and) {
      omitted.and = filter.and.map((part) => getFilterOmitting(part, ...keys))

      if (omitted.and.every((part) => Object.keys(part).length === 0)) {
        delete omitted.and
      }
    } else if (k === 'or' && filter.or) {
      omitted.or = filter.or.map((part) => getFilterOmitting(part, ...keys))

      if (omitted.or.every((part) => Object.keys(part).length === 0)) {
        delete omitted.or
      }
    } else if (!keys.includes(k)) {
      omitted[k] = filter[k]
    }

    return omitted
  }, {} as Filter<DTO>)

export function applyFilter<DTO>(dto: DTO[], filter: Filter<DTO>): DTO[]
export function applyFilter<DTO>(dto: DTO, filter: Filter<DTO>): boolean
export function applyFilter<DTO>(dtoOrArray: DTO | DTO[], filter: Filter<DTO>): boolean | DTO[] {
  const filterFunc = FilterBuilder.build(filter)
  if (Array.isArray(dtoOrArray)) {
    return dtoOrArray.filter((dto) => filterFunc(dto))
  }
  return filterFunc(dtoOrArray)
}
