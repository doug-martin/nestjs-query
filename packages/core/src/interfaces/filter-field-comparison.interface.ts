/**
 * Field comparisons with a type of `boolean`.
 */
import { Filter } from './filter.interface'

export interface BooleanFieldComparisons {
  /**
   * Is operator.
   *
   * ```ts
   * // field IS TRUE
   * { field: { is: true } }
   *
   * // field IS FALSE
   * { field: { is: false } }
   *
   * // field IS NULL
   * { field: { is: null } }
   * ```
   */
  is?: boolean | null
  /**
   * Is not operator.
   *
   * ```ts
   * // field IS NOT TRUE
   * { field: { isNot: true } }
   *
   * // field IS NOT FALSE
   * { field: { isNot: false } }
   *
   * // field IS NOT NULL
   * { field: { isNot: null } }
   * ```
   */
  isNot?: boolean | null
}

export interface CommonFieldComparisonBetweenType<FieldType> {
  lower: FieldType
  upper: FieldType
}

/**
 * Field comparisons for all types that are NOT `null` or `boolean`.
 *
 * @typeparam FieldType - The TS type of the field.
 */
export interface CommonFieldComparisonType<FieldType> extends BooleanFieldComparisons {
  /**
   * Field equality.
   *
   * ```ts
   * // field = "bar"
   * { field: { eq: 'bar' } }
   * ```
   */
  eq?: FieldType
  /**
   * Field in-equality.
   *
   * ```ts
   * // field != "bar"
   * { field: { neq: 'bar' } }
   * ```
   */
  neq?: FieldType
  /**
   * Greater than comparison.
   *
   * ```ts
   * // field > 1
   * { field: { gt: 1 } }
   * ```
   */
  gt?: FieldType
  /**
   * Greater than or equal to comparison.
   *
   * ```ts
   * // field >= 1
   * { field: { gte: 1 } }
   * ```
   */
  gte?: FieldType
  /**
   * Less than comparison.
   *
   * ```ts
   * // field < 1
   * { field: { lt: 1 } }
   * ```
   */
  lt?: FieldType
  /**
   * Less than or equal to comparison.
   *
   * ```ts
   * // field <= 1
   * { field: { lte: 1 } }
   * ```
   */
  lte?: FieldType
  /**
   * Check that a field is included in an array of values.
   *
   * ```ts
   * // field IN ("a", "b", "c")
   * { field: { in: ['a', 'b', 'c'] } }
   * ```
   */
  in?: FieldType[]
  /**
   * Check that a field is not included in an array of values.
   *
   * ```ts
   * // field NOT IN ("a", "b", "c")
   * { field: { notIn: ['a', 'b', 'c'] } }
   * ```
   */
  notIn?: FieldType[]
  /**
   * Checks that a field is between a lower and upper bound. The bounds are included!
   *
   * ```ts
   * // field BETWEEN lower AND upper
   * { field: { between: { lower: 1, upper: 10 } } }
   * ```
   */
  between?: CommonFieldComparisonBetweenType<FieldType>
  /**
   * Checks that a field is not between a lower and upper bound. The bounds are excluded!
   *
   * ```ts
   * // field NOT BETWEEN lower AND upper
   * { field: { notBetween: { lower: 1, upper: 10 } } }
   * ```
   */
  notBetween?: CommonFieldComparisonBetweenType<FieldType>
}

/**
 * Field comparisons for `string` types.
 */
export interface StringFieldComparisons extends CommonFieldComparisonType<string> {
  /**
   * Like comparison.
   *
   * ```ts
   * // field LIKE "Foo%"
   * { field: { like: 'Foo%' } }
   * ```
   */
  like?: string
  /**
   * Not like comparison.
   *
   * ```ts
   * // field NOT LIKE "Foo%"
   * { field: { notLike: 'Foo%' } }
   * ```
   */
  notLike?: string
  /**
   * Case insensitive like comparison.
   *
   * ```ts
   * // field ILIKE "Foo%"
   * { field: { iLike: 'Foo%' } }
   * ```
   */
  iLike?: string
  /**
   * Case insensitive not like comparison.
   *
   * ```ts
   * // field NOT ILIKE "Foo%"
   * { field: { notILike: 'Foo%' } }
   * ```
   */
  notILike?: string
}

type BuiltInTypes = boolean | boolean | string | string | number | Date | RegExp | bigint | symbol | null | undefined | never

/**
 * Type for field comparisons.
 *
 * * `string` - [[StringFieldComparisons]]
 * * `boolean|null|undefined|never` - [[BooleanFieldComparisons]]
 * * all other types use [[CommonFieldComparisonType]]
 */
// eslint-disable-next-line @typescript-eslint/ban-types
type FilterFieldComparisonType<FieldType, IsKeys extends true | false> = FieldType extends string | String
  ? StringFieldComparisons // eslint-disable-next-line @typescript-eslint/ban-types
  : FieldType extends boolean | Boolean
  ? BooleanFieldComparisons
  : FieldType extends number | Date | RegExp | bigint | BuiltInTypes[] | symbol
  ? CommonFieldComparisonType<FieldType>
  : FieldType extends Array<infer U>
  ? CommonFieldComparisonType<U> | Filter<U> // eslint-disable-next-line @typescript-eslint/ban-types
  : IsKeys extends true
  ? CommonFieldComparisonType<FieldType> & StringFieldComparisons & Filter<FieldType>
  : CommonFieldComparisonType<FieldType> | Filter<FieldType>

/**
 * Type for field comparisons.
 *
 * * `string` - [[StringFieldComparisons]]
 * * `boolean|null|undefined|never` - [[BooleanFieldComparisons]]
 * * all other types use [[CommonFieldComparisonType]]
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type FilterFieldComparison<FieldType> = FilterFieldComparisonType<FieldType, false>

/**
 * Type for all comparison operators for a field type.
 *
 * @typeparam FieldType - The TS type of the field.
 */
export type FilterComparisonOperators<FieldType> = keyof FilterFieldComparisonType<FieldType, true>
