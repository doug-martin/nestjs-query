import { CommonFieldComparisonBetweenType, FilterComparisonOperators } from '../interfaces'
import {
  BetweenComparisonOperators,
  BooleanComparisonOperators,
  InComparisonOperators,
  isBetweenComparisonOperators,
  isBooleanComparisonOperators,
  isInComparisonOperators,
  isLikeComparisonOperator,
  isRangeComparisonOperators,
  LikeComparisonOperators,
  RangeComparisonOperators
} from './filter.helpers'
import { ComparisonField, FilterFn } from './types'

const compare =
  <DTO>(filter: (dto: DTO) => boolean, fallback: boolean): FilterFn<DTO> =>
  (dto?: DTO) =>
    dto ? filter(dto) : fallback

export class ComparisonBuilder {
  static build<DTO, F extends keyof DTO>(
    field: F,
    cmp: FilterComparisonOperators<DTO[F]>,
    val: ComparisonField<DTO, F>
  ): FilterFn<DTO> {
    if (isBooleanComparisonOperators(cmp)) {
      return this.booleanComparison(cmp, field, val as DTO[F])
    }
    if (isRangeComparisonOperators(cmp)) {
      return this.rangeComparison(cmp, field, val as DTO[F])
    }
    if (isInComparisonOperators(cmp)) {
      return this.inComparison(cmp, field, val as DTO[F][])
    }
    if (isLikeComparisonOperator(cmp)) {
      return this.likeComparison(cmp, field, val as unknown as string)
    }

    if (isBetweenComparisonOperators(cmp)) {
      return this.betweenComparison(cmp, field, val as CommonFieldComparisonBetweenType<DTO[F]>)
    }
    throw new Error(`unknown operator ${JSON.stringify(cmp)}`)
  }

  private static booleanComparison<DTO, F extends keyof DTO>(
    cmp: BooleanComparisonOperators,
    field: F,
    val: DTO[F]
  ): FilterFn<DTO> {
    if (cmp === 'neq') {
      return (dto?: DTO): boolean => (dto ? dto[field] : null) !== val
    }
    if (cmp === 'isNot') {
      // eslint-disable-next-line eqeqeq
      return (dto?: DTO): boolean => (dto ? dto[field] : null) != val
    }
    if (cmp === 'eq') {
      return (dto?: DTO): boolean => (dto ? dto[field] : null) === val
    }
    // eslint-disable-next-line eqeqeq
    return (dto?: DTO): boolean => (dto ? dto[field] : null) == val
  }

  private static rangeComparison<DTO, F extends keyof DTO>(cmp: RangeComparisonOperators, field: F, val: DTO[F]): FilterFn<DTO> {
    if (cmp === 'gt') {
      return compare((dto) => dto[field] > val, false)
    }
    if (cmp === 'gte') {
      return compare((dto) => dto[field] >= val, false)
    }
    if (cmp === 'lt') {
      return compare((dto) => dto[field] < val, false)
    }
    return compare((dto) => dto[field] <= val, false)
  }

  private static likeComparison<DTO, F extends keyof DTO>(cmp: LikeComparisonOperators, field: F, val: string): FilterFn<DTO> {
    if (cmp === 'like') {
      const likeRegexp = this.likeSearchToRegexp(val)
      return compare((dto) => likeRegexp.test(dto[field] as unknown as string), false)
    }
    if (cmp === 'notLike') {
      const likeRegexp = this.likeSearchToRegexp(val)
      return compare((dto) => !likeRegexp.test(dto[field] as unknown as string), true)
    }
    if (cmp === 'iLike') {
      const likeRegexp = this.likeSearchToRegexp(val, true)
      return compare((dto) => likeRegexp.test(dto[field] as unknown as string), false)
    }
    const likeRegexp = this.likeSearchToRegexp(val, true)
    return compare((dto) => !likeRegexp.test(dto[field] as unknown as string), true)
  }

  private static inComparison<DTO, F extends keyof DTO>(cmp: InComparisonOperators, field: F, val: DTO[F][]): FilterFn<DTO> {
    if (cmp === 'notIn') {
      return compare((dto) => !val.includes(dto[field]), true)
    }
    return compare((dto) => val.includes(dto[field]), false)
  }

  private static betweenComparison<DTO, F extends keyof DTO>(
    cmp: BetweenComparisonOperators,
    field: F,
    val: CommonFieldComparisonBetweenType<DTO[F]>
  ): FilterFn<DTO> {
    const { lower, upper } = val
    if (cmp === 'notBetween') {
      return compare((dto) => {
        const dtoVal = dto[field]
        return dtoVal < lower || dtoVal > upper
      }, true)
    }
    return compare((dto) => {
      const dtoVal = dto[field]
      return dtoVal >= lower && dtoVal <= upper
    }, false)
  }

  private static likeSearchToRegexp(likeStr: string, caseInsensitive = false): RegExp {
    const replaced = likeStr.replace(/%/g, '.*')
    return new RegExp(`^${replaced}$`, caseInsensitive ? 'ig' : 'g')
  }
}
