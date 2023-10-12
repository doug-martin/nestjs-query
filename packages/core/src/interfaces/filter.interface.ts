import { FilterFieldComparison } from './filter-field-comparison.interface';

/**
 * A comparison for fields in T.
 * @example
 * ```ts
 * // name LIKE "Foo%"
 * const filter: Filter<Item> = {
 *   { name: { like: 'Foo%' } },
 * }
 * ```
 *
 * @example
 * ```ts
 * // completed IS TRUE
 * const filter: Filter<Item> = {
 *   { completed: { is: true } },
 * }
 * ```
 * @typeparam T - the type of object to filter on.
 */
export type FilterComparisons<T> = {
  [K in keyof T]?: FilterFieldComparison<T[K]>;
};

/**
 * A grouping of filters that should be ANDed or ORed together.
 *
 * * @example
 * ```ts
 * // completed IS TRUE OR name = "Foo"
 * const filter: Filter<Item> = {
 *   or: [
 *     { completed: { is: true } },
 *     { name: { eq: "Foo" } },
 *   ]
 * }
 * ```
 *
 * @example
 * ```ts
 * // completed IS TRUE OR (age > 10 AND age < 20)
 * const filter: Filter<Item> = {
 *   or: [
 *     { completed: { is: true } },
 *     {
 *       and: [
 *         { age: { gt : 10 } },
 *         { age: { lt : 20 } },
 *       ]
 *     },
 *   ]
 * }
 * ```
 */
type FilterGrouping<T, C = Record<string, unknown>> = {
  /**
   * Group an array of filters with an AND operation.
   */
  and?: Filter<T, C>[];
  /**
   * Group an array of filters with an OR operation.
   */
  or?: Filter<T, C>[];
};

/**
 * Filter for type T.
 *
 * @example
 * ```ts
 * // name LIKE "Foo%"
 * const filter: Filter<Item> = {
 *   { name: { like: 'Foo%' } },
 * }
 * ```
 *
 * @example
 * ```ts
 * // completed IS TRUE
 * const filter: Filter<Item> = {
 *   { completed: { is: true } },
 * }
 * ```
 *
 * @example
 * ```ts
 * // completed IS TRUE OR name = "Foo"
 * const filter: Filter<Item> = {
 *   or: [
 *     { completed: { is: true } },
 *     { name: { eq: "Foo" } },
 *   ]
 * }
 * ```
 *
 * @example
 * ```ts
 * // completed IS TRUE OR (age > 10 AND age < 20)
 * const filter: Filter<Item> = {
 *   or: [
 *     { completed: { is: true } },
 *     {
 *       and: [
 *         { age: { gt : 10 } },
 *         { age: { lt : 20 } },
 *       ]
 *     },
 *   ]
 * }
 * ```
 *
 * @typeparam T - the type of object to filter on.
 * @typeparam C - custom filters defined for the filter.
 */
export type Filter<T, C = Record<string, unknown>> = FilterGrouping<T, C> &
  FilterComparisons<T> & { [K in keyof C]: C[K] };
