import { Filter } from './filter.interface'

export interface UpdateOneOptions<DTO> {
  /**
   * Additional filter to use when updating an entity by id. This could be used to apply an additional filter to ensure
   * that the entity belongs to a particular user.
   */
  filter?: Filter<DTO>
}
