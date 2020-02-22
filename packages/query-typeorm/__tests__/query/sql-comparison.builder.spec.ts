import { closeTestConnection, createTestConnection, getTestConnection } from '../__fixtures__/connection.fixture';
import { TestEntity } from '../__fixtures__/test.entity';
import { SQLComparisionBuilder } from '../../src/query';

describe('SQLComparisionBuilder', (): void => {
  beforeEach(createTestConnection);
  afterEach(closeTestConnection);

  const getRepo = () => getTestConnection().getRepository(TestEntity);
  const createSQLComparisionBuilder = () => new SQLComparisionBuilder(getRepo());

  it('should throw an error for an invalid comparison type', () => {
    // @ts-ignore
    expect(() => createSQLComparisionBuilder().build('stringType', 'bad', 'foo', 'TestEntity')).toThrow(
      'unknown operator "bad"',
    );
  });

  describe('eq comparisons', () => {
    it('should build a qualified eq sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('stringType', 'eq', 'foo', 'TestEntity')).toEqual({
        sql: 'TestEntity.stringType = :param0',
        params: { param0: 'foo' },
      });
    });

    it('should build an unqualified eq sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('stringType', 'eq', 'foo')).toEqual({
        sql: 'stringType = :param0',
        params: { param0: 'foo' },
      });
    });
  });

  describe('neq comparisons', () => {
    it('should build neq sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('numberType', 'neq', 1, 'TestEntity')).toEqual({
        sql: 'TestEntity.numberType != :param0',
        params: { param0: 1 },
      });
    });
  });

  describe('gt comparisons', () => {
    it('should build gt sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('numberType', 'gt', 1, 'TestEntity')).toEqual({
        sql: 'TestEntity.numberType > :param0',
        params: { param0: 1 },
      });
    });
  });

  describe('gt comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('numberType', 'gte', 1, 'TestEntity')).toEqual({
        sql: 'TestEntity.numberType >= :param0',
        params: { param0: 1 },
      });
    });
  });

  describe('lt comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('numberType', 'lt', 1, 'TestEntity')).toEqual({
        sql: 'TestEntity.numberType < :param0',
        params: { param0: 1 },
      });
    });
  });

  describe('lte comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('numberType', 'lte', 1, 'TestEntity')).toEqual({
        sql: 'TestEntity.numberType <= :param0',
        params: { param0: 1 },
      });
    });
  });

  describe('like comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('stringType', 'like', '%hello%', 'TestEntity')).toEqual({
        sql: 'TestEntity.stringType LIKE :param0',
        params: { param0: '%hello%' },
      });
    });
  });

  describe('notLike comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('stringType', 'notLike', '%hello%', 'TestEntity')).toEqual({
        sql: 'TestEntity.stringType NOT LIKE :param0',
        params: { param0: '%hello%' },
      });
    });
  });

  describe('iLike comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('stringType', 'iLike', '%hello%', 'TestEntity')).toEqual({
        sql: 'TestEntity.stringType ILIKE :param0',
        params: { param0: '%hello%' },
      });
    });
  });

  describe('notILike comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('stringType', 'notILike', '%hello%', 'TestEntity')).toEqual({
        sql: 'TestEntity.stringType NOT ILIKE :param0',
        params: { param0: '%hello%' },
      });
    });
  });

  describe('is comparisons', () => {
    it('should build is true', (): void => {
      expect(createSQLComparisionBuilder().build('boolType', 'is', true, 'TestEntity')).toEqual({
        sql: 'TestEntity.boolType IS TRUE',
        params: {},
      });
    });

    it('should build is false', (): void => {
      expect(createSQLComparisionBuilder().build('boolType', 'is', false, 'TestEntity')).toEqual({
        sql: 'TestEntity.boolType IS FALSE',
        params: {},
      });
    });

    it('should build is null', (): void => {
      expect(createSQLComparisionBuilder().build('boolType', 'is', null, 'TestEntity')).toEqual({
        sql: 'TestEntity.boolType IS NULL',
        params: {},
      });
    });

    it('should throw an error for values other than null true or false', () => {
      // @ts-ignore
      expect(() => createSQLComparisionBuilder().build('boolType', 'is', 'foo', 'TestEntity')).toThrowError(
        'unexpected is operator param foo',
      );
    });
  });

  describe('isNot comparisons', () => {
    it('should build is true', (): void => {
      expect(createSQLComparisionBuilder().build('boolType', 'isNot', true, 'TestEntity')).toEqual({
        sql: 'TestEntity.boolType IS NOT TRUE',
        params: {},
      });
    });

    it('should build is false', (): void => {
      expect(createSQLComparisionBuilder().build('boolType', 'isNot', false, 'TestEntity')).toEqual({
        sql: 'TestEntity.boolType IS NOT FALSE',
        params: {},
      });
    });

    it('should build is null', (): void => {
      expect(createSQLComparisionBuilder().build('boolType', 'isNot', null, 'TestEntity')).toEqual({
        sql: 'TestEntity.boolType IS NOT NULL',
        params: {},
      });
    });

    it('should throw an error for values other than null true or false', () => {
      // @ts-ignore
      expect(() => createSQLComparisionBuilder().build('boolType', 'isNot', 'foo', 'TestEntity')).toThrowError(
        'unexpected isNot operator param foo',
      );
    });
  });

  describe('in comparisons', () => {
    it('should build in comparisons', (): void => {
      const arr = [1, 2, 3];
      expect(createSQLComparisionBuilder().build('numberType', 'in', arr, 'TestEntity')).toEqual({
        sql: 'TestEntity.numberType IN (:...param0)',
        params: { param0: arr },
      });
    });

    it('should throw an error for empty array', (): void => {
      const arr: number[] = [];
      expect(() => createSQLComparisionBuilder().build('numberType', 'in', arr, 'TestEntity')).toThrow(
        'Invalid in value expected a non-empty array got []',
      );
    });

    it('should throw an error for non-array', (): void => {
      expect(() => createSQLComparisionBuilder().build('numberType', 'in', 1, 'TestEntity')).toThrow(
        'Invalid in value expected an array got 1',
      );
    });
  });

  describe('notIn comparisons', () => {
    it('should build notIn comparisons', (): void => {
      const arr = ['a', 'b', 'c'];
      expect(createSQLComparisionBuilder().build('stringType', 'notIn', arr, 'TestEntity')).toEqual({
        sql: 'TestEntity.stringType NOT IN (:...param0)',
        params: { param0: arr },
      });
    });

    it('should throw an error for empty array', (): void => {
      const arr: number[] = [];
      expect(() => createSQLComparisionBuilder().build('numberType', 'notIn', arr, 'TestEntity')).toThrow(
        'Invalid in value expected a non-empty array got []',
      );
    });

    it('should throw an error for non-array', (): void => {
      expect(() => createSQLComparisionBuilder().build('numberType', 'notIn', 1, 'TestEntity')).toThrow(
        'Invalid in value expected an array got 1',
      );
    });
  });
});
