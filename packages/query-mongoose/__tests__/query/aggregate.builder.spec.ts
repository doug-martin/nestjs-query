/* eslint-disable @typescript-eslint/naming-convention */
import { AggregateQuery } from '@nestjs-query/core';
import { TestEntity } from '../__fixtures__/test.entity';
import { AggregateBuilder } from '../../src/query';

describe('AggregateBuilder', (): void => {
  const createAggregateBuilder = () => new AggregateBuilder<TestEntity>();

  it('should throw an error if no selects are generated', (): void => {
    expect(() => createAggregateBuilder().build({})).toThrow('No aggregate fields found.');
  });

  it('should create an aggregate query', (): void => {
    const agg: AggregateQuery<TestEntity> = {
      count: ['id', 'stringType'],
      avg: ['numberType'],
      sum: ['numberType'],
      max: ['stringType', 'dateType', 'numberType'],
      min: ['stringType', 'dateType', 'numberType'],
    };
    expect(createAggregateBuilder().build(agg)).toEqual({
      _id: null,
      avg_numberType: { $avg: '$numberType' },
      count_id: { $sum: { $cond: { else: 1, if: { $in: [{ $type: '$_id' }, ['missing', 'null']] }, then: 0 } } },
      count_stringType: {
        $sum: { $cond: { else: 1, if: { $in: [{ $type: '$stringType' }, ['missing', 'null']] }, then: 0 } },
      },
      max_dateType: { $max: '$dateType' },
      max_numberType: { $max: '$numberType' },
      max_stringType: { $max: '$stringType' },
      min_dateType: { $min: '$dateType' },
      min_numberType: { $min: '$numberType' },
      min_stringType: { $min: '$stringType' },
      sum_numberType: { $sum: '$numberType' },
    });
  });

  describe('.convertToAggregateResponse', () => {
    it('should convert a flat response into an Aggregtate response', () => {
      const dbResult = [
        {
          _id: { group_by_stringType: 'z' },
          count_id: 10,
          sum_numberType: 55,
          avg_numberType: 5,
          max_stringType: 'z',
          max_numberType: 10,
          min_stringType: 'a',
          min_numberType: 1,
        },
      ];
      expect(AggregateBuilder.convertToAggregateResponse<TestEntity>(dbResult)).toEqual([
        {
          groupBy: { stringType: 'z' },
          count: { id: 10 },
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
