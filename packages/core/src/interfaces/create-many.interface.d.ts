import { DeepPartial } from '../common';
export interface CreateMany<T, P extends DeepPartial<T>> {
    items: P[];
}
