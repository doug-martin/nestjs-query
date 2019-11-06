import {
  closeTestConnection,
  createTestConnection,
  getTestConnection,
} from '../../test/__fixtures__/connection.fixture';
import { TestEntity } from '../../test/__fixtures__/test.entity';
import { SQLComparisionBuilder } from './sql-comparison.builder';

describe('SQLComparisionBuilder', (): void => {
  beforeEach(createTestConnection);
  afterEach(closeTestConnection);

  const getRepo = () => getTestConnection().getRepository(TestEntity);
  const createSQLComparisionBuilder = () => new SQLComparisionBuilder(getRepo());

  it('should throw an error for an invalid comparison type', () => {
    // @ts-ignore
    expect(() => createSQLComparisionBuilder().build('stringType', 'bad', 'foo')).toThrow('unknown operator "bad"');
  });

  describe('eq comparisons', () => {
    it('should build eq sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('stringType', 'eq', 'foo')).toEqual({
        sql: '"string_type" = :param0',
        params: { param0: 'foo' },
      });
    });
  });

  describe('neq comparisons', () => {
    it('should build neq sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('numberType', 'neq', 1)).toEqual({
        sql: '"number_type" != :param0',
        params: { param0: 1 },
      });
    });
  });

  describe('gt comparisons', () => {
    it('should build gt sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('numberType', 'gt', 1)).toEqual({
        sql: '"number_type" > :param0',
        params: { param0: 1 },
      });
    });
  });

  describe('gt comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('numberType', 'gte', 1)).toEqual({
        sql: '"number_type" >= :param0',
        params: { param0: 1 },
      });
    });
  });

  describe('lt comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('numberType', 'lt', 1)).toEqual({
        sql: '"number_type" < :param0',
        params: { param0: 1 },
      });
    });
  });

  describe('lte comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('numberType', 'lte', 1)).toEqual({
        sql: '"number_type" <= :param0',
        params: { param0: 1 },
      });
    });
  });

  describe('like comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('stringType', 'like', '%hello%')).toEqual({
        sql: '"string_type" LIKE :param0',
        params: { param0: '%hello%' },
      });
    });
  });

  describe('notLike comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('stringType', 'notLike', '%hello%')).toEqual({
        sql: '"string_type" NOT LIKE :param0',
        params: { param0: '%hello%' },
      });
    });
  });

  describe('iLike comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('stringType', 'iLike', '%hello%')).toEqual({
        sql: '"string_type" ILIKE :param0',
        params: { param0: '%hello%' },
      });
    });
  });

  describe('notILike comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisionBuilder().build('stringType', 'notILike', '%hello%')).toEqual({
        sql: '"string_type" NOT ILIKE :param0',
        params: { param0: '%hello%' },
      });
    });
  });

  describe('is comparisons', () => {
    it('should build is true', (): void => {
      expect(createSQLComparisionBuilder().build('boolType', 'is', true)).toEqual({
        sql: '"bool_type" IS TRUE',
        params: {},
      });
    });

    it('should build is false', (): void => {
      expect(createSQLComparisionBuilder().build('boolType', 'is', false)).toEqual({
        sql: '"bool_type" IS FALSE',
        params: {},
      });
    });

    it('should build is null', (): void => {
      expect(createSQLComparisionBuilder().build('boolType', 'is', null)).toEqual({
        sql: '"bool_type" IS NULL',
        params: {},
      });
    });

    it('should throw an error for values other than null true or false', () => {
      // @ts-ignore
      expect(() => createSQLComparisionBuilder().build('boolType', 'is', 'foo')).toThrowError(
        'unexpected is operator param foo',
      );
    });
  });

  describe('in comparisons', () => {
    it('should build in comparisons', (): void => {
      const arr = [1, 2, 3];
      expect(createSQLComparisionBuilder().build('numberType', 'in', arr)).toEqual({
        sql: '"number_type" IN (:...param0)',
        params: { param0: arr },
      });
    });

    it('should throw an error for empty array', (): void => {
      const arr: number[] = [];
      expect(() => createSQLComparisionBuilder().build('numberType', 'in', arr)).toThrow(
        'Invalid in value expected a non-empty array got []',
      );
    });

    it('should throw an error for non-array', (): void => {
      expect(() => createSQLComparisionBuilder().build('numberType', 'in', 1)).toThrow(
        'Invalid in value expected an array got 1',
      );
    });
  });

  describe('notIn comparisons', () => {
    it('should build notIn comparisons', (): void => {
      const arr = ['a', 'b', 'c'];
      expect(createSQLComparisionBuilder().build('stringType', 'notIn', arr)).toEqual({
        sql: '"string_type" NOT IN (:...param0)',
        params: { param0: arr },
      });
    });

    it('should throw an error for empty array', (): void => {
      const arr: number[] = [];
      expect(() => createSQLComparisionBuilder().build('numberType', 'notIn', arr)).toThrow(
        'Invalid in value expected a non-empty array got []',
      );
    });

    it('should throw an error for non-array', (): void => {
      expect(() => createSQLComparisionBuilder().build('numberType', 'notIn', 1)).toThrow(
        'Invalid in value expected an array got 1',
      );
    });
  });
});
