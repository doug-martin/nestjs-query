import { DeepPartial } from '../common';

export interface UpdateOne<T, P extends DeepPartial<T>> {
  id: string | number;
  update: P;
}
