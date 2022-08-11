import { Filterable } from './filterable.interface'

export interface DeleteOneOptions<DTO> extends Filterable<DTO> {
  /**
   * Use soft delete when doing delete mutation
   */
  useSoftDelete?: boolean
}
