import { Filter, FilterComparisons, FilterFieldComparison } from '../interfaces';
import { ComparisonBuilder, isComparison } from './comparison.builder';
import { ComparisonField, FilterFn } from './types';

export class FilterBuilder {
  static build<DTO>(filter: Filter<DTO>): FilterFn<DTO> {
    const { and, or } = filter;
    const filters: FilterFn<DTO>[] = [];

    if (and) {
      filters.push(this.andFilterFn(...and.map((f) => this.build(f))));
    }

    if (or) {
      filters.push(this.orFilterFn(...or.map((f) => this.build(f))));
    }

    filters.push(this.filterFieldsOrNested(filter));
    return this.andFilterFn(...filters);
  }

  private static andFilterFn<DTO>(...filterFns: FilterFn<DTO>[]): FilterFn<DTO> {
    return (dto) => filterFns.every((filter) => filter(dto));
  }

  private static orFilterFn<DTO>(...filterFns: FilterFn<DTO>[]): FilterFn<DTO> {
    return (dto) => filterFns.some((filter) => filter(dto));
  }

  private static filterFieldsOrNested<DTO>(filter: Filter<DTO>): FilterFn<DTO> {
    return this.andFilterFn(
      ...Object.keys(filter)
        .filter((k) => k !== 'and' && k !== 'or')
        .map((fieldOrNested) => {
          const value = this.getField(filter as FilterComparisons<DTO>, fieldOrNested as keyof DTO);

          if (isComparison(filter[fieldOrNested as keyof DTO])) {
            return this.withFilterComparison(fieldOrNested as keyof DTO, value);
          }

          const nestedFilterFn = this.build(value);
          return (dto?: DTO) => nestedFilterFn(dto ? dto[fieldOrNested as keyof DTO] : null);
        }),
    );
  }

  private static getField<DTO, K extends keyof FilterComparisons<DTO>>(
    obj: FilterComparisons<DTO>,
    field: K,
  ): FilterFieldComparison<DTO[K]> & Filter<DTO[K]> {
    return obj[field] as FilterFieldComparison<DTO[K]> & Filter<DTO[K]>;
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
