/**
 * Interface for paging a collection.
 */
export interface Paging {
  /**
   * The maximum number of items that should be in the collection.
   */
  limit?: number
  /**
   * When paging through a collection, the offset represents the index to start at.
   */
  offset?: number
}
