import { Filter } from '@nestjs-query/core';
import { closeTestConnection, createTestConnection, getTestConnection } from '../__fixtures__/connection.fixture';
import { TestEntity } from '../__fixtures__/test.entity';
import { WhereBuilder } from '../../src/query';

describe('WhereBuilder', (): void => {
  beforeEach(createTestConnection);
  afterEach(closeTestConnection);

  const baseQuery =
    'SELECT' +
    ' "TestEntity"."test_entity_pk" AS "TestEntity_test_entity_pk",' +
    ' "TestEntity"."string_type" AS "TestEntity_string_type",' +
    ' "TestEntity"."bool_type" AS "TestEntity_bool_type",' +
    ' "TestEntity"."number_type" AS "TestEntity_number_type",' +
    ' "TestEntity"."date_type" AS "TestEntity_date_type",' +
    ' "TestEntity"."oneTestRelationTestRelationPk" AS "TestEntity_oneTestRelationTestRelationPk"' +
    ' FROM "test_entity" "TestEntity"';

  const getRepo = () => getTestConnection().getRepository(TestEntity);
  const getQueryBuilder = () => getRepo().createQueryBuilder();
  const createWhereBuilder = () => new WhereBuilder<TestEntity>();

  const assertSQL = (filter: Filter<TestEntity>, expectedSql: string, expectedArgs: any[]): void => {
    const selectQueryBuilder = createWhereBuilder().build(getQueryBuilder(), filter, [], 'TestEntity');
    const [sql, params] = selectQueryBuilder.getQueryAndParameters();
    expect(sql).toEqual(`${baseQuery}${expectedSql}`);
    expect(params).toEqual(expectedArgs);
  };

  it('should accept a empty filter', (): void => {
    assertSQL({}, '', []);
  });

  it('or multiple operators for a single field together', (): void => {
    assertSQL(
      {
        numberType: { gt: 10, lt: 20, gte: 21, lte: 31 },
      },
      ` WHERE ("TestEntity"."number_type" > ? OR "TestEntity"."number_type" < ? OR "TestEntity"."number_type" >= ? OR "TestEntity"."number_type" <= ?)`,
      [10, 20, 21, 31],
    );
  });

  it('and multiple field comparisons together', (): void => {
    assertSQL(
      {
        numberType: { eq: 1 },
        stringType: { like: 'foo%' },
        boolType: { is: true },
      },
      ` WHERE ("TestEntity"."number_type" = ?) AND ("TestEntity"."string_type" LIKE ?) AND ("TestEntity"."bool_type" IS TRUE)`,
      [1, 'foo%'],
    );
  });

  describe('and', (): void => {
    it('and multiple expressions together', (): void => {
      assertSQL(
        {
          and: [
            { numberType: { gt: 10 } },
            { numberType: { lt: 20 } },
            { numberType: { gte: 30 } },
            { numberType: { lte: 40 } },
          ],
        },
        ` WHERE ((("TestEntity"."number_type" > ?)) AND (("TestEntity"."number_type" < ?)) AND (("TestEntity"."number_type" >= ?)) AND (("TestEntity"."number_type" <= ?)))`,
        [10, 20, 30, 40],
      );
    });

    it('and multiple filters together with multiple fields', (): void => {
      assertSQL(
        {
          and: [
            { numberType: { gt: 10 }, stringType: { like: 'foo%' } },
            { numberType: { lt: 20 }, stringType: { like: '%bar' } },
          ],
        },
        ` WHERE ((("TestEntity"."number_type" > ?) AND ("TestEntity"."string_type" LIKE ?)) AND (("TestEntity"."number_type" < ?) AND ("TestEntity"."string_type" LIKE ?)))`,
        [10, 'foo%', 20, '%bar'],
      );
    });

    it('should support nested ors', (): void => {
      assertSQL(
        {
          and: [
            { or: [{ numberType: { gt: 10 } }, { numberType: { lt: 20 } }] },
            { or: [{ numberType: { gte: 30 } }, { numberType: { lte: 40 } }] },
          ],
        },
        ` WHERE ((((("TestEntity"."number_type" > ?)) OR (("TestEntity"."number_type" < ?)))) AND (((("TestEntity"."number_type" >= ?)) OR (("TestEntity"."number_type" <= ?)))))`,
        [10, 20, 30, 40],
      );
    });

    it('should properly group AND with a sibling field comparison', (): void => {
      assertSQL(
        {
          and: [{ numberType: { gt: 2 } }, { numberType: { lt: 10 } }],
          stringType: { eq: 'foo' },
        },
        ` WHERE ((("TestEntity"."number_type" > ?)) AND (("TestEntity"."number_type" < ?))) AND ("TestEntity"."string_type" = ?)`,
        [2, 10, 'foo'],
      );
    });
  });

  describe('or', (): void => {
    it('or multiple expressions together', (): void => {
      assertSQL(
        {
          or: [
            { numberType: { gt: 10 } },
            { numberType: { lt: 20 } },
            { numberType: { gte: 30 } },
            { numberType: { lte: 40 } },
          ],
        },
        ` WHERE ((("TestEntity"."number_type" > ?)) OR (("TestEntity"."number_type" < ?)) OR (("TestEntity"."number_type" >= ?)) OR (("TestEntity"."number_type" <= ?)))`,
        [10, 20, 30, 40],
      );
    });

    it('and multiple and filters together', (): void => {
      assertSQL(
        {
          or: [
            { numberType: { gt: 10 }, stringType: { like: 'foo%' } },
            { numberType: { lt: 20 }, stringType: { like: '%bar' } },
          ],
        },
        ` WHERE ((("TestEntity"."number_type" > ?) AND ("TestEntity"."string_type" LIKE ?)) OR (("TestEntity"."number_type" < ?) AND ("TestEntity"."string_type" LIKE ?)))`,
        [10, 'foo%', 20, '%bar'],
      );
    });

    it('should support nested ands', (): void => {
      assertSQL(
        {
          or: [
            { and: [{ numberType: { gt: 10 } }, { numberType: { lt: 20 } }] },
            { and: [{ numberType: { gte: 30 } }, { numberType: { lte: 40 } }] },
          ],
        },
        ` WHERE ((((("TestEntity"."number_type" > ?)) AND (("TestEntity"."number_type" < ?)))) OR (((("TestEntity"."number_type" >= ?)) AND (("TestEntity"."number_type" <= ?)))))`,
        [10, 20, 30, 40],
      );
    });

    it('should properly group OR with a sibling field comparison', (): void => {
      assertSQL(
        {
          or: [{ numberType: { eq: 2 } }, { numberType: { gt: 10 } }],
          stringType: { eq: 'foo' },
        },
        ` WHERE ((("TestEntity"."number_type" = ?)) OR (("TestEntity"."number_type" > ?))) AND ("TestEntity"."string_type" = ?)`,
        [2, 10, 'foo'],
      );
    });
  });
});
