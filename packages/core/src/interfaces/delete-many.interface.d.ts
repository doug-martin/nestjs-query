import { Filter } from './filter.interface';
export interface DeleteMany<T> {
    filter: Filter<T>;
}
