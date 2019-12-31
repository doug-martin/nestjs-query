import { Paging } from './paging.interface';
import { Filter } from './filter.interface';
import { SortField } from './sort-field.interface';

export interface Query<T> {
  paging?: Paging;
  filter?: Filter<T>;
  sorting?: SortField<T>[];
}
