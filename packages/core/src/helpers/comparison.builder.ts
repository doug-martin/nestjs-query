import { CommonFieldComparisonBetweenType, FilterComparisonOperators } from '../interfaces';
import { ComparisonField, FilterFn } from './types';

type LikeComparisonOperators = 'like' | 'notLike' | 'iLike' | 'notILike';
type InComparisonOperators = 'in' | 'notIn';
type BetweenComparisonOperators = 'between' | 'notBetween';
type RangeComparisonOperators = 'gt' | 'gte' | 'lt' | 'lte';
type BooleanComparisonOperators = 'eq' | 'neq' | 'is' | 'isNot';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isLikeComparisonOperator = (op: any): op is LikeComparisonOperators => {
  return op === 'like' || op === 'notLike' || op === 'iLike' || op === 'notILike';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isInComparisonOperators = (op: any): op is InComparisonOperators => {
  return op === 'in' || op === 'notIn';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isBetweenComparisonOperators = (op: any): op is BetweenComparisonOperators => {
  return op === 'between' || op === 'notBetween';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isRangeComparisonOperators = (op: any): op is RangeComparisonOperators => {
  return op === 'gt' || op === 'gte' || op === 'lt' || op === 'lte';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isBooleanComparisonOperators = (op: any): op is BooleanComparisonOperators => {
  return op === 'eq' || op === 'neq' || op === 'is' || op === 'isNot';
};

export class ComparisonBuilder {
  static build<DTO, F extends keyof DTO>(
    field: F,
    cmp: FilterComparisonOperators<DTO[F]>,
    val: ComparisonField<DTO, F>,
  ): FilterFn<DTO> {
    if (isBooleanComparisonOperators(cmp)) {
      return this.booleanComparison(cmp, field, val as DTO[F]);
    }
    if (isRangeComparisonOperators(cmp)) {
      return this.rangeComparison(cmp, field, val as DTO[F]);
    }
    if (isInComparisonOperators(cmp)) {
      return this.inComparison(cmp, field, val as DTO[F][]);
    }
    if (isLikeComparisonOperator(cmp)) {
      return this.likeComparison(cmp, field, (val as unknown) as string);
    }

    if (isBetweenComparisonOperators(cmp)) {
      return this.betweenComparison(cmp, field, val as CommonFieldComparisonBetweenType<DTO[F]>);
    }
    throw new Error(`unknown operator ${JSON.stringify(cmp)}`);
  }

  private static booleanComparison<DTO, F extends keyof DTO>(
    cmp: BooleanComparisonOperators,
    field: F,
    val: DTO[F],
  ): FilterFn<DTO> {
    if (cmp === 'neq' || cmp === 'isNot') {
      return (dto: DTO): boolean => dto[field] !== val;
    }
    return (dto: DTO): boolean => dto[field] === val;
  }

  private static rangeComparison<DTO, F extends keyof DTO>(
    cmp: RangeComparisonOperators,
    field: F,
    val: DTO[F],
  ): FilterFn<DTO> {
    if (cmp === 'gt') {
      return (dto: DTO): boolean => dto[field] > val;
    }
    if (cmp === 'gte') {
      return (dto: DTO): boolean => dto[field] >= val;
    }
    if (cmp === 'lt') {
      return (dto: DTO): boolean => dto[field] < val;
    }
    return (dto: DTO): boolean => dto[field] <= val;
  }

  private static likeComparison<DTO, F extends keyof DTO>(
    cmp: LikeComparisonOperators,
    field: F,
    val: string,
  ): FilterFn<DTO> {
    if (cmp === 'like') {
      const likeRegexp = this.likeSearchToRegexp(val);
      return (dto: DTO): boolean => {
        return likeRegexp.test((dto[field] as unknown) as string);
      };
    }
    if (cmp === 'notLike') {
      const likeRegexp = this.likeSearchToRegexp(val);
      return (dto: DTO): boolean => !likeRegexp.test((dto[field] as unknown) as string);
    }
    if (cmp === 'iLike') {
      const likeRegexp = this.likeSearchToRegexp(val, true);
      return (dto: DTO): boolean => likeRegexp.test((dto[field] as unknown) as string);
    }
    const likeRegexp = this.likeSearchToRegexp(val, true);
    return (dto: DTO): boolean => !likeRegexp.test((dto[field] as unknown) as string);
  }

  private static inComparison<DTO, F extends keyof DTO>(
    cmp: InComparisonOperators,
    field: F,
    val: DTO[F][],
  ): FilterFn<DTO> {
    if (cmp === 'notIn') {
      return (dto: DTO): boolean => !val.includes(dto[field]);
    }
    return (dto: DTO): boolean => val.includes(dto[field]);
  }

  private static betweenComparison<DTO, F extends keyof DTO>(
    cmp: BetweenComparisonOperators,
    field: F,
    val: CommonFieldComparisonBetweenType<DTO[F]>,
  ): FilterFn<DTO> {
    const { lower, upper } = val;
    if (cmp === 'notBetween') {
      return (dto: DTO): boolean => {
        const dtoVal = dto[field];
        return dtoVal < lower || dtoVal > upper;
      };
    }
    return (dto: DTO): boolean => {
      const dtoVal = dto[field];
      return dtoVal >= lower && dtoVal <= upper;
    };
  }

  private static likeSearchToRegexp(likeStr: string, caseInsensitive = false): RegExp {
    const replaced = likeStr.replace(/%/g, '.*');
    return new RegExp(`^${replaced}$`, caseInsensitive ? 'ig' : 'g');
  }
}
