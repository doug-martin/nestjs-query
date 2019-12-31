import { FilterFieldComparison } from './filter-field-comparison.interface';

export type FilterComparisons<T> = {
  [K in keyof T]?: FilterFieldComparison<T[K]>;
};

export type FilterGrouping<T> = {
  and?: Filter<T>[];
  or?: Filter<T>[];
};

export type Filter<T> = FilterGrouping<T> & FilterComparisons<T>;
