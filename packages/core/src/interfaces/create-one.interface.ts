import { DeepPartial } from '../common';

export interface CreateOne<T, P extends DeepPartial<T>> {
  item: P;
}
