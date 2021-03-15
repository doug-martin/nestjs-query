import { CommonFieldComparisonBetweenType } from '@nestjs-query/core';
import { TestEntity } from '../__fixtures__/test.entity';
import { ComparisonBuilder } from '../../src/query';

describe('ComparisonBuilder', (): void => {
  const createComparisonBuilder = () => new ComparisonBuilder<TestEntity>();

  it('should throw an error for an invalid comparison type', () => {
    // @ts-ignore
    expect(() => createComparisonBuilder().build('stringType', 'bad', 'foo')).toThrow('unknown operator "bad"');
  });

  describe('eq comparisons', () => {
    it('should build an unqualified eq sql fragment', (): void => {
      expect(createComparisonBuilder().build('stringType', 'eq', 'foo')).toEqual({
        stringType: {
          $eq: 'foo',
        },
      });
    });
  });

  it('should build neq sql fragment', (): void => {
    expect(createComparisonBuilder().build('numberType', 'neq', 1)).toEqual({
      numberType: {
        $ne: 1,
      },
    });
  });

  it('should build gt sql fragment', (): void => {
    expect(createComparisonBuilder().build('numberType', 'gt', 1)).toEqual({
      numberType: {
        $gt: 1,
      },
    });
  });

  it('should build gte sql fragment', (): void => {
    expect(createComparisonBuilder().build('numberType', 'gte', 1)).toEqual({
      numberType: {
        $gte: 1,
      },
    });
  });

  it('should build lt sql fragment', (): void => {
    expect(createComparisonBuilder().build('numberType', 'lt', 1)).toEqual({
      numberType: {
        $lt: 1,
      },
    });
  });

  it('should build lte sql fragment', (): void => {
    expect(createComparisonBuilder().build('numberType', 'lte', 1)).toEqual({
      numberType: {
        $lte: 1,
      },
    });
  });

  it('should build like sql fragment', (): void => {
    expect(createComparisonBuilder().build('stringType', 'like', '%hello%')).toEqual({
      stringType: {
        $regex: /.*hello.*/,
      },
    });
  });

  it('should build notLike sql fragment', (): void => {
    expect(createComparisonBuilder().build('stringType', 'notLike', '%hello%')).toEqual({
      stringType: {
        $not: { $regex: /.*hello.*/ },
      },
    });
  });

  it('should build iLike sql fragment', (): void => {
    expect(createComparisonBuilder().build('stringType', 'iLike', '%hello%')).toEqual({
      stringType: {
        $regex: /.*hello.*/i,
      },
    });
  });

  it('should build notILike sql fragment', (): void => {
    expect(createComparisonBuilder().build('stringType', 'notILike', '%hello%')).toEqual({
      stringType: {
        $not: { $regex: /.*hello.*/i },
      },
    });
  });

  describe('is comparisons', () => {
    it('should build is true', (): void => {
      expect(createComparisonBuilder().build('boolType', 'is', true)).toEqual({
        boolType: {
          $eq: true,
        },
      });
    });

    it('should build is false', (): void => {
      expect(createComparisonBuilder().build('boolType', 'is', false)).toEqual({
        boolType: {
          $eq: false,
        },
      });
    });

    it('should build is null', (): void => {
      expect(createComparisonBuilder().build('boolType', 'is', null)).toEqual({
        boolType: {
          $eq: null,
        },
      });
    });
  });

  describe('isNot comparisons', () => {
    it('should build is true', (): void => {
      expect(createComparisonBuilder().build('boolType', 'isNot', true)).toEqual({
        boolType: {
          $ne: true,
        },
      });
    });

    it('should build is false', (): void => {
      expect(createComparisonBuilder().build('boolType', 'isNot', false)).toEqual({
        boolType: {
          $ne: false,
        },
      });
    });

    it('should build is null', (): void => {
      expect(createComparisonBuilder().build('boolType', 'isNot', null)).toEqual({
        boolType: {
          $ne: null,
        },
      });
    });
  });

  describe('in comparisons', () => {
    it('should build in comparisons', (): void => {
      const arr = [1, 2, 3];
      expect(createComparisonBuilder().build('numberType', 'in', arr)).toEqual({
        numberType: {
          $in: arr,
        },
      });
    });
  });

  describe('notIn comparisons', () => {
    it('should build notIn comparisons', (): void => {
      const arr = ['a', 'b', 'c'];
      expect(createComparisonBuilder().build('stringType', 'notIn', arr)).toEqual({
        stringType: {
          $nin: arr,
        },
      });
    });
  });

  describe('between comparisons', () => {
    it('should build between comparisons', (): void => {
      const between: CommonFieldComparisonBetweenType<number> = { lower: 1, upper: 10 };
      expect(createComparisonBuilder().build('numberType', 'between', between)).toEqual({
        numberType: { $gte: between.lower, $lte: between.upper },
      });
    });

    it('should throw an error if the comparison is not a between comparison', (): void => {
      const between = [1, 10];
      expect(() => createComparisonBuilder().build('numberType', 'between', between)).toThrow(
        'Invalid value for between expected {lower: val, upper: val} got [1,10]',
      );
    });
  });

  describe('notBetween comparisons', () => {
    it('should build not between comparisons', (): void => {
      const between: CommonFieldComparisonBetweenType<number> = { lower: 1, upper: 10 };
      expect(createComparisonBuilder().build('numberType', 'notBetween', between)).toEqual({
        numberType: { $lt: between.lower, $gt: between.upper },
      });
    });

    it('should throw an error if the comparison is not a between comparison', (): void => {
      const between = [1, 10];
      expect(() => createComparisonBuilder().build('numberType', 'notBetween', between)).toThrow(
        'Invalid value for not between expected {lower: val, upper: val} got [1,10]',
      );
    });
  });
});
