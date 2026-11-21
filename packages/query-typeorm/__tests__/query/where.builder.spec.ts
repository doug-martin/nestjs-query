import { getQueryTypeormMetadata } from '../../src/common';
import { WhereBuilder } from '../../src/query';
import { closeTestConnection, createTestConnection, getTestConnection } from '../__fixtures__/connection.fixture';
import { TestEntity } from '../__fixtures__/test.entity';
import { getCustomFilterRegistry } from '../utils';
import { TestEntityFilter } from '../__fixtures__/types';

describe('WhereBuilder', (): void => {
  beforeEach(() => createTestConnection());
  afterEach(() => closeTestConnection());

  const getRepo = () => getTestConnection().getRepository(TestEntity);
  const getQueryBuilder = () => getRepo().createQueryBuilder();
  const createWhereBuilder = () =>
    new WhereBuilder<TestEntity>(getQueryTypeormMetadata(getTestConnection()), {
      customFilterRegistry: getCustomFilterRegistry(getTestConnection()),
    });

  const expectSQLSnapshot = (filter: TestEntityFilter): void => {
    const selectQueryBuilder = createWhereBuilder().build(getQueryBuilder(), filter, {}, TestEntity, 'TestEntity');
    const [sql, params] = selectQueryBuilder.getQueryAndParameters();
    expect(sql).toMatchSnapshot();
    expect(params).toMatchSnapshot();
  };

  it('should accept a empty filter', (): void => {
    expectSQLSnapshot({});
  });

  it('or multiple operators for a single field together', (): void => {
    expectSQLSnapshot({ numberType: { gt: 10, lt: 20, gte: 21, lte: 31 } });
  });

  it('and multiple field comparisons together', (): void => {
    expectSQLSnapshot({ numberType: { eq: 1 }, stringType: { like: 'foo%' }, boolType: { is: true } });
  });

  it('should accept custom filters alongside regular filters', (): void => {
    expectSQLSnapshot({
      // This has the global isMultipleOf filter
      numberType: { gte: 1, lte: 10, isMultipleOf: 5 },
      // Here, the isMultipleOf filter was overridden for dateType only
      dateType: { isMultipleOf: 3 },
      // This is a more complex filter involving geospatial queries
      fakePointType: { distanceFrom: { point: { lat: 45.3, lng: 9.5 }, radius: 50000 } },
      // This is a custom filter that does a subquery
      pendingTestRelations: { gt: 5 },
    });
  });

  describe('and', (): void => {
    it('and multiple expressions together', (): void => {
      expectSQLSnapshot({
        and: [
          { numberType: { gt: 10 } },
          { numberType: { lt: 20 } },
          { numberType: { gte: 30 } },
          { numberType: { lte: 40 } },
        ],
      });
    });

    it('and multiple expressions together with custom filters', (): void => {
      expectSQLSnapshot({
        and: [
          { numberType: { gt: 10 } },
          { numberType: { lt: 20 } },
          { numberType: { gte: 30 } },
          { numberType: { lte: 40 } },
          { numberType: { isMultipleOf: 5 } },
          { dateType: { isMultipleOf: 3 } },
          { fakePointType: { distanceFrom: { point: { lat: 45.3, lng: 9.5 }, radius: 50000 } } },
        ],
      });
    });

    it('and multiple filters together with multiple fields', (): void => {
      expectSQLSnapshot({
        and: [
          { numberType: { gt: 10 }, stringType: { like: 'foo%' } },
          { numberType: { lt: 20 }, stringType: { like: '%bar' } },
        ],
      });
    });

    it('should support nested ors', (): void => {
      expectSQLSnapshot({
        and: [
          { or: [{ numberType: { gt: 10 } }, { numberType: { lt: 20 } }] },
          { or: [{ numberType: { gte: 30 } }, { numberType: { lte: 40 } }] },
        ],
      });
    });

    it('should properly group AND with a sibling field comparison', (): void => {
      expectSQLSnapshot({ and: [{ numberType: { gt: 2 } }, { numberType: { lt: 10 } }], stringType: { eq: 'foo' } });
    });
  });

  describe('or', (): void => {
    it('or multiple expressions together', (): void => {
      expectSQLSnapshot({
        or: [
          { numberType: { gt: 10 } },
          { numberType: { lt: 20 } },
          { numberType: { gte: 30 } },
          { numberType: { lte: 40 } },
        ],
      });
    });

    it('or multiple expressions together with custom filter', (): void => {
      expectSQLSnapshot({
        or: [
          { numberType: { gt: 10 } },
          { numberType: { lt: 20 } },
          { numberType: { gte: 30 } },
          { numberType: { lte: 40 } },
          { numberType: { isMultipleOf: 5 } },
          { dateType: { isMultipleOf: 3 } },
          { fakePointType: { distanceFrom: { point: { lat: 45.3, lng: 9.5 }, radius: 50000 } } },
        ],
      });
    });

    it('and multiple and filters together', (): void => {
      expectSQLSnapshot({
        or: [
          { numberType: { gt: 10 }, stringType: { like: 'foo%' } },
          { numberType: { lt: 20 }, stringType: { like: '%bar' } },
        ],
      });
    });

    it('should support nested ands', (): void => {
      expectSQLSnapshot({
        or: [
          { and: [{ numberType: { gt: 10 } }, { numberType: { lt: 20 } }] },
          { and: [{ numberType: { gte: 30 } }, { numberType: { lte: 40 } }] },
        ],
      });
    });

    it('should properly group OR with a sibling field comparison', (): void => {
      expectSQLSnapshot({ or: [{ numberType: { eq: 2 } }, { numberType: { gt: 10 } }], stringType: { eq: 'foo' } });
    });
  });
});
