import { Filterable } from './filterable.interface';

export interface FindByIdOptions<DTO> extends Filterable<DTO> {
  /**
   * Allow also deleted records to be get
   */
  withDeleted?: boolean;
}
