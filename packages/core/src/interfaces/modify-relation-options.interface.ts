import { Filter } from './filter.interface'
import { Filterable } from './filterable.interface'

export interface ModifyRelationOptions<DTO, Relation> extends Filterable<DTO> {
  /**
   * A filter to use in addition to the primary key(s) when finding the relations to add to the DTO.
   * For example this could be used to ensure that the a user has access to the records that are being related.
   */
  relationFilter?: Filter<Relation>
}
