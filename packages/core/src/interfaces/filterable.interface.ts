import { Filter } from './filter.interface'

/**
 * Base interface for all types that allow filtering
 */
export interface Filterable<DTO> {
  /**
   * Filter to use when operating on a entities.
   *
   * When using with a single entity operation (e.g. findById) the filter can be used to apply an additional filter to
   * ensure that the entity belongs to a particular user.
   */
  filter?: Filter<DTO>
}
