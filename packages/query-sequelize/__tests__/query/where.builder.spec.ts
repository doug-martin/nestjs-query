import { Filter } from '@nestjs-query/core';
import { WhereOptions, Op } from 'sequelize';
import { TestEntity } from '../__fixtures__/test.entity';
import { WhereBuilder } from '../../src/query';

describe('WhereBuilder', (): void => {
  const createWhereBuilder = () => new WhereBuilder<TestEntity>();

  const expectWhereQuery = (filter: Filter<TestEntity>, expectedWhereOpts: WhereOptions<TestEntity>): void => {
    const actual = createWhereBuilder().build(filter, new Map());
    expect(actual).toEqual(expectedWhereOpts);
  };

  it('should accept a empty filter', (): void => {
    expectWhereQuery({}, {});
  });

  it('or multiple operators for a single field together', (): void => {
    expectWhereQuery(
      {
        numberType: { gt: 10, lt: 20, gte: 21, lte: 31 },
      },
      {
        [Op.and]: [
          {
            [Op.or]: [
              { numberType: { [Op.gt]: 10 } },
              { numberType: { [Op.lt]: 20 } },
              { numberType: { [Op.gte]: 21 } },
              { numberType: { [Op.lte]: 31 } },
            ],
          },
        ],
      },
    );
  });

  it('and multiple field comparisons together', (): void => {
    expectWhereQuery(
      {
        numberType: { gt: 1 },
        stringType: { like: 'foo%' },
      },
      {
        [Op.and]: [
          {
            [Op.and]: [{ numberType: { [Op.gt]: 1 } }, { stringType: { [Op.like]: 'foo%' } }],
          },
        ],
      },
    );
  });

  describe('and', (): void => {
    it('and multiple expressions together', (): void => {
      expectWhereQuery(
        {
          and: [
            { numberType: { gt: 10 } },
            { numberType: { lt: 20 } },
            { numberType: { gte: 30 } },
            { numberType: { lte: 40 } },
          ],
        },
        {
          [Op.and]: [
            { [Op.and]: [{ numberType: { [Op.gt]: 10 } }] },
            { [Op.and]: [{ numberType: { [Op.lt]: 20 } }] },
            { [Op.and]: [{ numberType: { [Op.gte]: 30 } }] },
            { [Op.and]: [{ numberType: { [Op.lte]: 40 } }] },
          ],
        },
      );
    });

    it('and multiple filters together with multiple fields', (): void => {
      expectWhereQuery(
        {
          and: [
            { numberType: { gt: 10 }, stringType: { like: 'foo%' } },
            { numberType: { lt: 20 }, stringType: { like: '%bar' } },
          ],
        },
        {
          [Op.and]: [
            { [Op.and]: [{ [Op.and]: [{ numberType: { [Op.gt]: 10 } }, { stringType: { [Op.like]: 'foo%' } }] }] },
            { [Op.and]: [{ [Op.and]: [{ numberType: { [Op.lt]: 20 } }, { stringType: { [Op.like]: '%bar' } }] }] },
          ],
        },
      );
    });

    it('should support nested ors', (): void => {
      expectWhereQuery(
        {
          and: [
            { or: [{ numberType: { gt: 10 } }, { numberType: { lt: 20 } }] },
            { or: [{ numberType: { gte: 30 } }, { numberType: { lte: 40 } }] },
          ],
        },
        {
          [Op.and]: [
            {
              [Op.or]: [
                { [Op.and]: [{ numberType: { [Op.gt]: 10 } }] },
                { [Op.and]: [{ numberType: { [Op.lt]: 20 } }] },
              ],
            },
            {
              [Op.or]: [
                { [Op.and]: [{ numberType: { [Op.gte]: 30 } }] },
                { [Op.and]: [{ numberType: { [Op.lte]: 40 } }] },
              ],
            },
          ],
        },
      );
    });
  });

  describe('or', (): void => {
    it('or multiple expressions together', (): void => {
      expectWhereQuery(
        {
          or: [
            { numberType: { gt: 10 } },
            { numberType: { lt: 20 } },
            { numberType: { gte: 30 } },
            { numberType: { lte: 40 } },
          ],
        },
        {
          [Op.or]: [
            { [Op.and]: [{ numberType: { [Op.gt]: 10 } }] },
            { [Op.and]: [{ numberType: { [Op.lt]: 20 } }] },
            { [Op.and]: [{ numberType: { [Op.gte]: 30 } }] },
            { [Op.and]: [{ numberType: { [Op.lte]: 40 } }] },
          ],
        },
      );
    });

    it('and multiple and filters together', (): void => {
      expectWhereQuery(
        {
          or: [
            { numberType: { gt: 10 }, stringType: { like: 'foo%' } },
            { numberType: { lt: 20 }, stringType: { like: '%bar' } },
          ],
        },
        {
          [Op.or]: [
            {
              [Op.and]: [
                {
                  [Op.and]: [{ numberType: { [Op.gt]: 10 } }, { stringType: { [Op.like]: 'foo%' } }],
                },
              ],
            },
            {
              [Op.and]: [
                {
                  [Op.and]: [{ numberType: { [Op.lt]: 20 } }, { stringType: { [Op.like]: '%bar' } }],
                },
              ],
            },
          ],
        },
      );
    });

    it('should support nested ands', (): void => {
      expectWhereQuery(
        {
          or: [
            { and: [{ numberType: { gt: 10 } }, { numberType: { lt: 20 } }] },
            { and: [{ numberType: { gte: 30 } }, { numberType: { lte: 40 } }] },
          ],
        },
        {
          [Op.or]: [
            {
              [Op.and]: [
                { [Op.and]: [{ numberType: { [Op.gt]: 10 } }] },
                { [Op.and]: [{ numberType: { [Op.lt]: 20 } }] },
              ],
            },
            {
              [Op.and]: [
                { [Op.and]: [{ numberType: { [Op.gte]: 30 } }] },
                { [Op.and]: [{ numberType: { [Op.lte]: 40 } }] },
              ],
            },
          ],
        },
      );
    });
  });
});
