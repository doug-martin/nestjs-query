/* eslint-disable @typescript-eslint/naming-convention */
import { AggregateQuery } from '@nestjs-query/core';
import sequelize, { Projectable } from 'sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CONNECTION_OPTIONS } from '../__fixtures__/sequelize.fixture';
import { TestEntityTestRelationEntity } from '../__fixtures__/test-entity-test-relation.entity';
import { TestRelation } from '../__fixtures__/test-relation.entity';
import { TestEntity } from '../__fixtures__/test.entity';
import { AggregateBuilder } from '../../src/query';

describe('AggregateBuilder', (): void => {
  let moduleRef: TestingModule;
  const createAggregateBuilder = () => new AggregateBuilder<TestEntity>(TestEntity);

  const expectAggregateQuery = (agg: AggregateQuery<TestEntity>, expected: Projectable): void => {
    const actual = createAggregateBuilder().build(agg);
    expect(actual).toEqual(expected);
  };

  afterEach(() => moduleRef.get(Sequelize).close());

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(CONNECTION_OPTIONS),
        SequelizeModule.forFeature([TestEntity, TestRelation, TestEntityTestRelationEntity]),
      ],
    }).compile();
    await moduleRef.get(Sequelize).sync();
  });

  it('should throw an error if no selects are generated', (): void => {
    expect(() => createAggregateBuilder().build({})).toThrow('No aggregate fields found.');
  });

  it('should create selects for all aggregate functions', (): void => {
    expectAggregateQuery(
      {
        count: ['testEntityPk', 'stringType'],
        avg: ['numberType'],
        sum: ['numberType'],
        max: ['stringType', 'dateType', 'numberType'],
        min: ['stringType', 'dateType', 'numberType'],
      },
      {
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('test_entity_pk')), 'COUNT_testEntityPk'],
          [sequelize.fn('COUNT', sequelize.col('string_type')), 'COUNT_stringType'],
          [sequelize.fn('SUM', sequelize.col('number_type')), 'SUM_numberType'],
          [sequelize.fn('AVG', sequelize.col('number_type')), 'AVG_numberType'],
          [sequelize.fn('MAX', sequelize.col('string_type')), 'MAX_stringType'],
          [sequelize.fn('MAX', sequelize.col('date_type')), 'MAX_dateType'],
          [sequelize.fn('MAX', sequelize.col('number_type')), 'MAX_numberType'],
          [sequelize.fn('MIN', sequelize.col('string_type')), 'MIN_stringType'],
          [sequelize.fn('MIN', sequelize.col('date_type')), 'MIN_dateType'],
          [sequelize.fn('MIN', sequelize.col('number_type')), 'MIN_numberType'],
        ],
      },
    );
  });

  it('should create selects for all aggregate functions and group bys', (): void => {
    expectAggregateQuery(
      {
        groupBy: ['stringType', 'boolType'],
        count: ['testEntityPk'],
      },
      {
        attributes: [
          [sequelize.col('string_type'), 'GROUP_BY_stringType'],
          [sequelize.col('bool_type'), 'GROUP_BY_boolType'],
          [sequelize.fn('COUNT', sequelize.col('test_entity_pk')), 'COUNT_testEntityPk'],
        ],
      },
    );
  });

  describe('.convertToAggregateResponse', () => {
    it('should convert a flat response into an Aggregtate response', () => {
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
