import { SortDirection, SortField, SortNulls } from '../interfaces'

type SortResult = -1 | 0 | 1
type SortComparator<Field> = (a: Field, b: Field) => SortResult
type Sorter<DTO> = (dtos: DTO[]) => DTO[]

function isNullish(a: unknown): a is null | undefined {
  return a === null || a === undefined
}

function nullComparator(a: null | undefined, b: null | undefined) {
  if (a === b) {
    return 0
  }
  return a === null ? 1 : -1
}

function nullsFirstSort(a: unknown, b: unknown): SortResult {
  if (!(isNullish(a) || isNullish(b))) {
    return 0
  }
  if (isNullish(a) && isNullish(b)) {
    return nullComparator(a, b)
  }
  return isNullish(a) ? -1 : 1
}

function nullsLastSort(a: unknown, b: unknown): SortResult {
  return (nullsFirstSort(a, b) * -1) as SortResult
}

function ascSort<Field>(a: Field, b: Field): SortResult {
  if (a === b) {
    return 0
  }
  return a < b ? -1 : 1
}

function descSort<Field>(a: Field, b: Field): SortResult {
  return (ascSort(a, b) * -1) as SortResult
}

export class SortBuilder {
  static build<DTO>(sorts: SortField<DTO>[]): Sorter<DTO> {
    const comparators = sorts.map(({ field, direction, nulls }) => this.buildComparator(field, direction, nulls))
    const comparator: SortComparator<DTO> = (a, b): SortResult =>
      comparators.reduce((result: SortResult, cmp) => {
        if (result === 0) {
          return cmp(a, b)
        }
        return result
      }, 0)
    return (dtos: DTO[]): DTO[] => [...dtos].sort(comparator)
  }

  static buildComparator<DTO>(field: keyof DTO, direction: SortDirection, nulls?: SortNulls): SortComparator<DTO> {
    const nullSort = this.nullsComparator(direction, nulls)
    const fieldValueComparator = this.fieldValueComparator(field, direction)
    return (a, b): SortResult => {
      const aField = a[field]
      const bField = b[field]
      const nullResult = nullSort(aField, bField)
      if (nullResult !== 0) {
        return nullResult
      }
      return fieldValueComparator(aField, bField)
    }
  }

  static fieldValueComparator<DTO, Field extends keyof DTO>(
    field: keyof DTO,
    direction: SortDirection
  ): SortComparator<DTO[Field]> {
    if (direction === SortDirection.ASC) {
      return (a, b) => ascSort(a, b)
    }
    return (a, b) => descSort(a, b)
  }

  static nullsComparator<Field>(direction: SortDirection, nulls?: SortNulls): SortComparator<Field> {
    switch (nulls) {
      case SortNulls.NULLS_FIRST:
        return nullsFirstSort
      case SortNulls.NULLS_LAST:
        return nullsLastSort
      default:
        switch (direction) {
          case SortDirection.DESC:
            return nullsFirstSort
          default:
            return nullsLastSort
        }
    }
  }
}
