import { Filter, FilterComparisons, FilterFieldComparison } from '../interfaces'
import { ComparisonBuilder } from './comparison.builder'
import { getFilterFieldComparison, isComparison } from './filter.helpers'
import { ComparisonField, FilterFn } from './types'

export class FilterBuilder {
  static build<DTO>(filter: Filter<DTO>): FilterFn<DTO> {
    const { and, or } = filter
    const filters: FilterFn<DTO>[] = []

    if (and && and.length) {
      filters.push(this.andFilterFn(...and.map((f) => this.build(f))))
    }

    if (or && or.length) {
      filters.push(this.orFilterFn(...or.map((f) => this.build(f))))
    }
    if (Object.keys(filter).length) {
      filters.push(this.filterFieldsOrNested(filter))
    }
    return this.andFilterFn(...filters)
  }

  private static andFilterFn<DTO>(...filterFns: FilterFn<DTO>[]): FilterFn<DTO> {
    return (dto) => filterFns.every((filter) => filter(dto))
  }

  private static orFilterFn<DTO>(...filterFns: FilterFn<DTO>[]): FilterFn<DTO> {
    return (dto) => filterFns.some((filter) => filter(dto))
  }

  private static filterFieldsOrNested<DTO>(filter: Filter<DTO>): FilterFn<DTO> {
    return this.andFilterFn(
      ...Object.keys(filter)
        .filter((k) => k !== 'and' && k !== 'or')
        .map((fieldOrNested) => this.withComparison(filter, fieldOrNested as keyof DTO))
    )
  }

  private static withFilterComparison<DTO, T extends keyof DTO>(field: T, cmp: FilterFieldComparison<DTO[T]>): FilterFn<DTO> {
    const operators = Object.keys(cmp) as (keyof FilterFieldComparison<DTO[T]>)[]
    return this.orFilterFn(
      ...operators.map((operator) => ComparisonBuilder.build(field, operator, cmp[operator] as ComparisonField<DTO, T>))
    )
  }

  private static withComparison<DTO>(filter: FilterComparisons<DTO>, fieldOrNested: keyof DTO): FilterFn<DTO> {
    const value = getFilterFieldComparison(filter, fieldOrNested)
    if (isComparison(value)) {
      return this.withFilterComparison(fieldOrNested, value)
    }
    if (typeof value !== 'object') {
      throw new Error(`unknown comparison ${JSON.stringify(fieldOrNested)}`)
    }
    const nestedFilterFn = this.build(value)
    return (dto?: DTO) => nestedFilterFn(dto ? dto[fieldOrNested] : null)
  }
}
