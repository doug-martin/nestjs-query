import { CommonFieldComparisonBetweenType } from '@nestjs-query/core';
import { Op } from 'sequelize';
import { TestEntity } from '../__fixtures__/test.entity';
import { SQLComparisonBuilder } from '../../src/query';

describe('SQLComparisonBuilder', (): void => {
  const createSQLComparisonBuilder = () => new SQLComparisonBuilder<TestEntity>();

  it('should throw an error for an invalid comparison type', () => {
    // @ts-ignore
    expect(() => createSQLComparisonBuilder().build('stringType', 'bad', 'foo')).toThrow('unknown operator "bad"');
  });

  describe('eq comparisons', () => {
    it('should build an unqualified eq sql fragment', (): void => {
      expect(createSQLComparisonBuilder().build('stringType', 'eq', 'foo')).toEqual({
        stringType: {
          [Op.eq]: 'foo',
        },
      });
    });
  });

  it('should build neq sql fragment', (): void => {
    expect(createSQLComparisonBuilder().build('numberType', 'neq', 1)).toEqual({
      numberType: {
        [Op.ne]: 1,
      },
    });
  });

  it('should build gt sql fragment', (): void => {
    expect(createSQLComparisonBuilder().build('numberType', 'gt', 1)).toEqual({
      numberType: {
        [Op.gt]: 1,
      },
    });
  });

  it('should build gte sql fragment', (): void => {
    expect(createSQLComparisonBuilder().build('numberType', 'gte', 1)).toEqual({
      numberType: {
        [Op.gte]: 1,
      },
    });
  });

  it('should build lt sql fragment', (): void => {
    expect(createSQLComparisonBuilder().build('numberType', 'lt', 1)).toEqual({
      numberType: {
        [Op.lt]: 1,
      },
    });
  });

  it('should build lte sql fragment', (): void => {
    expect(createSQLComparisonBuilder().build('numberType', 'lte', 1)).toEqual({
      numberType: {
        [Op.lte]: 1,
      },
    });
  });

  it('should build like sql fragment', (): void => {
    expect(createSQLComparisonBuilder().build('stringType', 'like', '%hello%')).toEqual({
      stringType: {
        [Op.like]: '%hello%',
      },
    });
  });

  it('should build notLike sql fragment', (): void => {
    expect(createSQLComparisonBuilder().build('stringType', 'notLike', '%hello%')).toEqual({
      stringType: {
        [Op.notLike]: '%hello%',
      },
    });
  });

  it('should build iLike sql fragment', (): void => {
    expect(createSQLComparisonBuilder().build('stringType', 'iLike', '%hello%')).toEqual({
      stringType: {
        [Op.iLike]: '%hello%',
      },
    });
  });

  it('should build notILike sql fragment', (): void => {
    expect(createSQLComparisonBuilder().build('stringType', 'notILike', '%hello%')).toEqual({
      stringType: {
        [Op.notILike]: '%hello%',
      },
    });
  });

  describe('is comparisons', () => {
    it('should build is true', (): void => {
      expect(createSQLComparisonBuilder().build('boolType', 'is', true)).toEqual({
        boolType: {
          [Op.is]: true,
        },
      });
    });

    it('should build is false', (): void => {
      expect(createSQLComparisonBuilder().build('boolType', 'is', false)).toEqual({
        boolType: {
          [Op.is]: false,
        },
      });
    });

    it('should build is null', (): void => {
      expect(createSQLComparisonBuilder().build('boolType', 'is', null)).toEqual({
        boolType: {
          [Op.is]: null,
        },
      });
    });
  });

  describe('isNot comparisons', () => {
    it('should build is true', (): void => {
      expect(createSQLComparisonBuilder().build('boolType', 'isNot', true)).toEqual({
        boolType: {
          [Op.not]: true,
        },
      });
    });

    it('should build is false', (): void => {
      expect(createSQLComparisonBuilder().build('boolType', 'isNot', false)).toEqual({
        boolType: {
          [Op.not]: false,
        },
      });
    });

    it('should build is null', (): void => {
      expect(createSQLComparisonBuilder().build('boolType', 'isNot', null)).toEqual({
        boolType: {
          [Op.not]: null,
        },
      });
    });
  });

  describe('in comparisons', () => {
    it('should build in comparisons', (): void => {
      const arr = [1, 2, 3];
      expect(createSQLComparisonBuilder().build('numberType', 'in', arr)).toEqual({
        numberType: {
          [Op.in]: arr,
        },
      });
    });
  });

  describe('notIn comparisons', () => {
    it('should build notIn comparisons', (): void => {
      const arr = ['a', 'b', 'c'];
      expect(createSQLComparisonBuilder().build('stringType', 'notIn', arr)).toEqual({
        stringType: {
          [Op.notIn]: arr,
        },
      });
    });
  });

  describe('between comparisons', () => {
    it('should build between comparisons', (): void => {
      const between: CommonFieldComparisonBetweenType<number> = { lower: 1, upper: 10 };
      expect(createSQLComparisonBuilder().build('numberType', 'between', between)).toEqual({
        numberType: {
          [Op.between]: [between.lower, between.upper],
        },
      });
    });

    it('should throw an error if the comparison is not a between comparison', (): void => {
      const between = [1, 10];
      expect(() => createSQLComparisonBuilder().build('numberType', 'between', between)).toThrow(
        'Invalid value for between expected {lower: val, upper: val} got [1,10]',
      );
    });
  });

  describe('notBetween comparisons', () => {
    it('should build not between comparisons', (): void => {
      const between: CommonFieldComparisonBetweenType<number> = { lower: 1, upper: 10 };
      expect(createSQLComparisonBuilder().build('numberType', 'notBetween', between)).toEqual({
        numberType: {
          [Op.notBetween]: [between.lower, between.upper],
        },
      });
    });

    it('should throw an error if the comparison is not a between comparison', (): void => {
      const between = [1, 10];
      expect(() => createSQLComparisonBuilder().build('numberType', 'notBetween', between)).toThrow(
        'Invalid value for not between expected {lower: val, upper: val} got [1,10]',
      );
    });
  });
});
