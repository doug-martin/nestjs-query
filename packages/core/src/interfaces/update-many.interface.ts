import { DeepPartial } from '../common';
import { Filter } from './filter.interface';

export interface UpdateMany<T, U extends DeepPartial<T>> {
  filter: Filter<T>;
  update: U;
}
