import { Filter, FilterComparisons, FilterFieldComparison } from '../interfaces';
import { ComparisonBuilder } from './comparison.builder';
import { ComparisonField, FilterFn } from './types';

export class FilterBuilder {
  static build<DTO>(filter: Filter<DTO>): FilterFn<DTO> {
    const { and, or } = filter;
    const filters: FilterFn<DTO>[] = [];
    if (and && and.length) {
      filters.push(this.andFilterFn(...and.map((f) => this.build(f))));
    }
    if (or && or.length) {
      filters.push(this.orFilterFn(...or.map((f) => this.build(f))));
    }
    filters.push(this.filterFields(filter));
    return this.andFilterFn(...filters);
  }

  private static andFilterFn<DTO>(...filterFns: FilterFn<DTO>[]): FilterFn<DTO> {
    return (dto) => filterFns.every((fn) => fn(dto));
  }

  private static orFilterFn<DTO>(...filterFns: FilterFn<DTO>[]): FilterFn<DTO> {
    return (dto) => filterFns.some((fn) => fn(dto));
  }

  private static filterFields<DTO>(filter: Filter<DTO>): FilterFn<DTO> {
    return this.andFilterFn(
      ...Object.keys(filter)
        .filter((k) => k !== 'and' && k !== 'or')
        .map((field) =>
          this.withFilterComparison(
            field as keyof DTO,
            this.getField(filter as FilterComparisons<DTO>, field as keyof DTO),
          ),
        ),
    );
  }

  private static getField<DTO, K extends keyof FilterComparisons<DTO>>(
    obj: FilterComparisons<DTO>,
    field: K,
  ): FilterFieldComparison<DTO[K]> {
    return obj[field] as FilterFieldComparison<DTO[K]>;
  }

  private static withFilterComparison<DTO, T extends keyof DTO>(
    field: T,
    cmp: FilterFieldComparison<DTO[T]>,
  ): FilterFn<DTO> {
    const operators = Object.keys(cmp) as (keyof FilterFieldComparison<DTO[T]>)[];
    return this.orFilterFn(
      ...operators.map((operator) =>
        ComparisonBuilder.build(field, operator, cmp[operator] as ComparisonField<DTO, T>),
      ),
    );
  }
}
