/* eslint-disable @typescript-eslint/naming-convention */
import { AggregateQuery } from '@nestjs-query/core';
import { closeTestConnection, createTestConnection, getTestConnection } from '../__fixtures__/connection.fixture';
import { TestEntity } from '../__fixtures__/test.entity';
import { AggregateBuilder } from '../../src/query';

describe('AggregateBuilder', (): void => {
  beforeEach(createTestConnection);
  afterEach(closeTestConnection);

  const getRepo = () => getTestConnection().getRepository(TestEntity);
  const getQueryBuilder = () => getRepo().createQueryBuilder();
  const createAggregateBuilder = () => new AggregateBuilder<TestEntity>();

  const expectSQLSnapshot = (agg: AggregateQuery<TestEntity>): void => {
    const selectQueryBuilder = createAggregateBuilder().build(getQueryBuilder(), agg, 'TestEntity');
    const [sql, params] = selectQueryBuilder.getQueryAndParameters();
    expect(sql).toMatchSnapshot();
    expect(params).toMatchSnapshot();
  };

  it('should throw an error if no selects are generated', (): void => {
    expect(() => createAggregateBuilder().build(getQueryBuilder(), {})).toThrow('No aggregate fields found.');
  });

  it('should create selects for all aggregate functions', (): void => {
    expectSQLSnapshot({
      count: ['testEntityPk'],
      avg: ['numberType'],
      sum: ['numberType'],
      max: ['stringType', 'dateType', 'numberType'],
      min: ['stringType', 'dateType', 'numberType'],
    });
  });

  it('should create selects for all aggregate functions and group bys', (): void => {
    expectSQLSnapshot({
      groupBy: ['stringType', 'boolType'],
      count: ['testEntityPk'],
    });
  });

  describe('.convertToAggregateResponse', () => {
    it('should convert a flat response into an Aggregate response', () => {
      const dbResult = [
        {
          GROUP_BY_stringType: 'z',
          COUNT_testEntityPk: 10,
          SUM_numberType: 55,
          AVG_numberType: 5,
          MAX_stringType: 'z',
          MAX_numberType: 10,
          MIN_stringType: 'a',
          MIN_numberType: 1,
        },
      ];
      expect(AggregateBuilder.convertToAggregateResponse<TestEntity>(dbResult)).toEqual([
        {
          groupBy: { stringType: 'z' },
          count: { testEntityPk: 10 },
          sum: { numberType: 55 },
          avg: { numberType: 5 },
          max: { stringType: 'z', numberType: 10 },
          min: { stringType: 'a', numberType: 1 },
        },
      ]);
    });

    it('should throw an error if a column is not expected', () => {
      const dbResult = [
        {
          COUNTtestEntityPk: 10,
        },
      ];
      expect(() => AggregateBuilder.convertToAggregateResponse<TestEntity>(dbResult)).toThrow(
        'Unknown aggregate column encountered.',
      );
    });
  });
});
