import { Filterable } from './filterable.interface'
import { Paging } from './paging.interface'
import { SortField } from './sort-field.interface'

/**
 * Interface for all queries to a collection of items.
 *
 * For example assume the following record type.
 *
 * ```ts
 * class Item {
 *   id: string;
 *   name: string;
 *   completed: boolean;
 * }
 * ```
 * Now lets create a query.
 *
 * ```ts
 * const query: Query<Item> = {
 *   filter: { name: { like: 'Foo%' } }, // filter name LIKE "Foo%"
 *   paging: { limit: 10, offset: 20}, // LIMIT 10 OFFSET 20
 *   sorting: [{ field: 'name', direction: SortDirection.DESC }], // ORDER BY name DESC
 * };
 * ```
 *
 * @typeparam T - the type of the object to query for.
 */
export interface Query<T> extends Filterable<T> {
  /**
   * Option to page through the collection.
   */
  paging?: Paging
  /**
   * Option to sort the collection.
   */
  sorting?: SortField<T>[]
}
