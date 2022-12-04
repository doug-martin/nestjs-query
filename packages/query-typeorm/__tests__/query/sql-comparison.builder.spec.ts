import { CommonFieldComparisonBetweenType } from '@ptc-org/nestjs-query-core'

import { randomString } from '../../src/common'
import { SQLComparisonBuilder } from '../../src/query'
import { TestEntity } from '../__fixtures__/test.entity'

jest.mock('../../src/common/randomString', () => ({ randomString: jest.fn() }))

describe('SQLComparisonBuilder', (): void => {
  const createSQLComparisonBuilder = () => new SQLComparisonBuilder<TestEntity>()

  beforeEach(() => {
    let index = -1
    ;(randomString as jest.Mock<any, any>).mockImplementation(() => {
      index += 1
      return index.toString()
    })
  })

  it('should throw an error for an invalid comparison type', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(() => createSQLComparisonBuilder().build('stringType', 'bad', 'foo', 'TestEntity')).toThrow('unknown operator "bad"')
  })

  describe('eq comparisons', () => {
    it('should build a qualified eq sql fragment', (): void => {
      expect(createSQLComparisonBuilder().build('stringType', 'eq', 'foo', 'TestEntity')).toEqual({
        sql: 'TestEntity.stringType = :param0',
        params: { param0: 'foo' }
      })
    })

    it('should build an unqualified eq sql fragment', (): void => {
      expect(createSQLComparisonBuilder().build('stringType', 'eq', 'foo')).toEqual({
        sql: 'stringType = :param0',
        params: { param0: 'foo' }
      })
    })
  })

  describe('neq comparisons', () => {
    it('should build neq sql fragment', (): void => {
      expect(createSQLComparisonBuilder().build('numberType', 'neq', 1, 'TestEntity')).toEqual({
        sql: 'TestEntity.numberType != :param0',
        params: { param0: 1 }
      })
    })
  })

  describe('gt comparisons', () => {
    it('should build gt sql fragment', (): void => {
      expect(createSQLComparisonBuilder().build('numberType', 'gt', 1, 'TestEntity')).toEqual({
        sql: 'TestEntity.numberType > :param0',
        params: { param0: 1 }
      })
    })
  })

  describe('gte comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisonBuilder().build('numberType', 'gte', 1, 'TestEntity')).toEqual({
        sql: 'TestEntity.numberType >= :param0',
        params: { param0: 1 }
      })
    })
  })

  describe('lt comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisonBuilder().build('numberType', 'lt', 1, 'TestEntity')).toEqual({
        sql: 'TestEntity.numberType < :param0',
        params: { param0: 1 }
      })
    })
  })

  describe('lte comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisonBuilder().build('numberType', 'lte', 1, 'TestEntity')).toEqual({
        sql: 'TestEntity.numberType <= :param0',
        params: { param0: 1 }
      })
    })
  })

  describe('like comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisonBuilder().build('stringType', 'like', '%hello%', 'TestEntity')).toEqual({
        sql: 'TestEntity.stringType LIKE :param0',
        params: { param0: '%hello%' }
      })
    })
  })

  describe('notLike comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisonBuilder().build('stringType', 'notLike', '%hello%', 'TestEntity')).toEqual({
        sql: 'TestEntity.stringType NOT LIKE :param0',
        params: { param0: '%hello%' }
      })
    })
  })

  describe('iLike comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisonBuilder().build('stringType', 'iLike', '%hello%', 'TestEntity')).toEqual({
        sql: 'TestEntity.stringType ILIKE :param0',
        params: { param0: '%hello%' }
      })
    })
  })

  describe('notILike comparisons', () => {
    it('should build gte sql fragment', (): void => {
      expect(createSQLComparisonBuilder().build('stringType', 'notILike', '%hello%', 'TestEntity')).toEqual({
        sql: 'TestEntity.stringType NOT ILIKE :param0',
        params: { param0: '%hello%' }
      })
    })
  })

  describe('is comparisons', () => {
    it('should build is true', (): void => {
      expect(createSQLComparisonBuilder().build('boolType', 'is', true, 'TestEntity')).toEqual({
        sql: 'TestEntity.boolType = TRUE',
        params: {}
      })
    })

    it('should build is false', (): void => {
      expect(createSQLComparisonBuilder().build('boolType', 'is', false, 'TestEntity')).toEqual({
        sql: 'TestEntity.boolType = FALSE',
        params: {}
      })
    })

    it('should build is null', (): void => {
      expect(createSQLComparisonBuilder().build('boolType', 'is', null, 'TestEntity')).toEqual({
        sql: 'TestEntity.boolType IS NULL',
        params: {}
      })
    })

    it('should throw an error for values other than null true or false', () => {
      // @ts-ignore
      expect(() => createSQLComparisonBuilder().build('boolType', 'is', 'foo', 'TestEntity')).toThrow(
        'unexpected is operator param "foo"'
      )
    })
  })

  describe('isNot comparisons', () => {
    it('should build is true', (): void => {
      expect(createSQLComparisonBuilder().build('boolType', 'isNot', true, 'TestEntity')).toEqual({
        sql: 'TestEntity.boolType != TRUE',
        params: {}
      })
    })

    it('should build is false', (): void => {
      expect(createSQLComparisonBuilder().build('boolType', 'isNot', false, 'TestEntity')).toEqual({
        sql: 'TestEntity.boolType != FALSE',
        params: {}
      })
    })

    it('should build is null', (): void => {
      expect(createSQLComparisonBuilder().build('boolType', 'isNot', null, 'TestEntity')).toEqual({
        sql: 'TestEntity.boolType IS NOT NULL',
        params: {}
      })
    })

    it('should throw an error for values other than null true or false', () => {
      // @ts-ignore
      expect(() => createSQLComparisonBuilder().build('boolType', 'isNot', 'foo', 'TestEntity')).toThrow(
        'unexpected isNot operator param "foo"'
      )
    })
  })

  describe('in comparisons', () => {
    it('should build in comparisons', (): void => {
      const arr = [1, 2, 3]
      expect(createSQLComparisonBuilder().build('numberType', 'in', arr, 'TestEntity')).toEqual({
        sql: 'TestEntity.numberType IN (:...param0)',
        params: { param0: arr }
      })
    })

    it('should throw an error for empty array', (): void => {
      const arr: number[] = []
      expect(() => createSQLComparisonBuilder().build('numberType', 'in', arr, 'TestEntity')).toThrow(
        'Invalid in value expected a non-empty array got []'
      )
    })

    it('should throw an error for non-array', (): void => {
      expect(() => createSQLComparisonBuilder().build('numberType', 'in', 1, 'TestEntity')).toThrow(
        'Invalid in value expected an array got 1'
      )
    })
  })

  describe('notIn comparisons', () => {
    it('should build notIn comparisons', (): void => {
      const arr = ['a', 'b', 'c']
      expect(createSQLComparisonBuilder().build('stringType', 'notIn', arr, 'TestEntity')).toEqual({
        sql: 'TestEntity.stringType NOT IN (:...param0)',
        params: { param0: arr }
      })
    })

    it('should throw an error for empty array', (): void => {
      const arr: number[] = []
      expect(() => createSQLComparisonBuilder().build('numberType', 'notIn', arr, 'TestEntity')).toThrow(
        'Invalid in value expected a non-empty array got []'
      )
    })

    it('should throw an error for non-array', (): void => {
      expect(() => createSQLComparisonBuilder().build('numberType', 'notIn', 1, 'TestEntity')).toThrow(
        'Invalid in value expected an array got 1'
      )
    })
  })

  describe('between comparisons', () => {
    it('should build between comparisons', (): void => {
      const between: CommonFieldComparisonBetweenType<number> = { lower: 1, upper: 10 }
      expect(createSQLComparisonBuilder().build('numberType', 'between', between, 'TestEntity')).toEqual({
        sql: 'TestEntity.numberType BETWEEN :param0 AND :param1',
        params: { param0: between.lower, param1: between.upper }
      })
    })

    it('should throw an error if the comparison is not a between comparison', (): void => {
      const between = [1, 10]
      expect(() => createSQLComparisonBuilder().build('numberType', 'between', between)).toThrow(
        'Invalid value for between expected {lower: val, upper: val} got [1,10]'
      )
    })
  })

  describe('notBetween comparisons', () => {
    it('should build not between comparisons', (): void => {
      const between: CommonFieldComparisonBetweenType<number> = { lower: 1, upper: 10 }
      expect(createSQLComparisonBuilder().build('numberType', 'notBetween', between, 'TestEntity')).toEqual({
        sql: 'TestEntity.numberType NOT BETWEEN :param0 AND :param1',
        params: { param0: between.lower, param1: between.upper }
      })
    })

    it('should throw an error if the comparison is not a between comparison', (): void => {
      const between = [1, 10]
      expect(() => createSQLComparisonBuilder().build('numberType', 'notBetween', between)).toThrow(
        'Invalid value for not between expected {lower: val, upper: val} got [1,10]'
      )
    })
  })
})
