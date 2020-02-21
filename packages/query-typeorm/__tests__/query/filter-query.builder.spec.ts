import { anything, instance, mock, verify, when } from 'ts-mockito';
import { QueryBuilder, WhereExpression } from 'typeorm';
import { Query, SortDirection, SortNulls } from '@nestjs-query/core';
import { closeTestConnection, createTestConnection, getTestConnection } from '../__fixtures__/connection.fixture';
import { TestEntity } from '../__fixtures__/test.entity';
import { FilterQueryBuilder, WhereBuilder } from '../../src/query';

describe('FilterQueryBuilder', (): void => {
  beforeEach(createTestConnection);
  afterEach(closeTestConnection);

  const baseSelectQuery =
    `SELECT` +
    ` "TestEntity"."testEntityPk" AS "TestEntity_testEntityPk",` +
    ` "TestEntity"."string_type" AS "TestEntity_string_type",` +
    ` "TestEntity"."bool_type" AS "TestEntity_bool_type",` +
    ` "TestEntity"."number_type" AS "TestEntity_number_type",` +
    ` "TestEntity"."date_type" AS "TestEntity_date_type",` +
    ` "TestEntity"."oneTestRelationTestRelationPk" AS "TestEntity_oneTestRelationTestRelationPk"` +
    ` FROM "test_entity" "TestEntity"`;

  const baseUpdateQuery = 'UPDATE "test_entity" SET "string_type" = ?';

  const baseDeleteQuery = 'DELETE FROM "test_entity"';

  const getEntityQueryBuilder = (whereBuilder: WhereBuilder<TestEntity>): FilterQueryBuilder<TestEntity> =>
    new FilterQueryBuilder(getTestConnection().getRepository(TestEntity), whereBuilder);

  const assertSQL = (query: QueryBuilder<TestEntity>, expectedSql: string, expectedArgs: any[]): void => {
    const [sql, params] = query.getQueryAndParameters();
    expect(sql).toEqual(expectedSql);
    expect(params).toEqual(expectedArgs);
  };

  const assertSelectSQL = (
    query: Query<TestEntity>,
    whereBuilder: WhereBuilder<TestEntity>,
    expectedSql: string,
    expectedArgs: any[],
  ): void => {
    const selectQueryBuilder = getEntityQueryBuilder(whereBuilder).select(query);
    assertSQL(selectQueryBuilder, `${baseSelectQuery}${expectedSql}`, expectedArgs);
  };

  const assertDeleteSQL = (
    query: Query<TestEntity>,
    whereBuilder: WhereBuilder<TestEntity>,
    expectedSql: string,
    expectedArgs: any[],
  ): void => {
    const selectQueryBuilder = getEntityQueryBuilder(whereBuilder).delete(query);
    assertSQL(selectQueryBuilder, `${baseDeleteQuery}${expectedSql}`, expectedArgs);
  };

  const assertUpdateSQL = (
    query: Query<TestEntity>,
    whereBuilder: WhereBuilder<TestEntity>,
    expectedSql: string,
    expectedArgs: any[],
  ): void => {
    const queryBuilder = getEntityQueryBuilder(whereBuilder)
      .update(query)
      .set({ stringType: 'baz' });
    assertSQL(queryBuilder, `${baseUpdateQuery}${expectedSql}`, ['baz', ...expectedArgs]);
  };

  describe('#select', () => {
    describe('with filter', () => {
      it('should not call whereBuilder#build', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertSelectSQL({}, instance(mockWhereBuilder), '', []);
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should call whereBuilder#build if there is a filter', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        const query = { filter: { stringType: { eq: 'foo' } } };
        when(mockWhereBuilder.build(anything(), query.filter)).thenCall((where: WhereExpression) => {
          return where.andWhere("string_type = 'foo'");
        });
        assertSelectSQL(query, instance(mockWhereBuilder), " WHERE string_type = 'foo'", []);
      });
    });

    describe('with paging', () => {
      it('should apply empty paging args', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertSelectSQL({}, instance(mockWhereBuilder), '', []);
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply paging args going forward', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertSelectSQL(
          {
            paging: {
              limit: 10,
              offset: 11,
            },
          },
          instance(mockWhereBuilder),
          ' LIMIT 10 OFFSET 11',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply paging args going backward', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertSelectSQL(
          {
            paging: {
              limit: 10,
              offset: 10,
            },
          },
          instance(mockWhereBuilder),
          ' LIMIT 10 OFFSET 10',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });
    });

    describe('with sorting', () => {
      it('should apply ASC sorting', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertSelectSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" ASC',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply ASC NULLS_FIRST sorting', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertSelectSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" ASC NULLS FIRST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply ASC NULLS_LAST sorting', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertSelectSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" ASC NULLS LAST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply DESC sorting', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertSelectSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" DESC',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply DESC NULLS_FIRST sorting', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertSelectSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_FIRST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" DESC NULLS FIRST',
          [],
        );
      });

      it('should apply DESC NULLS_LAST sorting', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertSelectSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" DESC NULLS LAST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply multiple sorts', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertSelectSQL(
          {
            sorting: [
              { field: 'numberType', direction: SortDirection.ASC },
              { field: 'boolType', direction: SortDirection.DESC },
              { field: 'stringType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST },
              { field: 'dateType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST },
            ],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" ASC, "bool_type" DESC, "string_type" ASC NULLS FIRST, "date_type" DESC NULLS LAST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });
    });
  });

  describe('#update', () => {
    describe('with paging', () => {
      it('should ignore paging args', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertUpdateSQL(
          {
            paging: {
              limit: 10,
              offset: 11,
            },
          },
          instance(mockWhereBuilder),
          '',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });
    });

    describe('with sorting', () => {
      it('should apply ASC sorting', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertUpdateSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" ASC',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply ASC NULLS_FIRST sorting', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertUpdateSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" ASC NULLS FIRST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply ASC NULLS_LAST sorting', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertUpdateSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" ASC NULLS LAST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply DESC sorting', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertUpdateSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" DESC',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply DESC NULLS_FIRST sorting', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertUpdateSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_FIRST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" DESC NULLS FIRST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply DESC NULLS_LAST sorting', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertUpdateSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" DESC NULLS LAST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply multiple sorts', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertUpdateSQL(
          {
            sorting: [
              { field: 'numberType', direction: SortDirection.ASC },
              { field: 'boolType', direction: SortDirection.DESC },
              { field: 'stringType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST },
              { field: 'dateType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST },
            ],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" ASC, "bool_type" DESC, "string_type" ASC NULLS FIRST, "date_type" DESC NULLS LAST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });
    });
  });

  describe('#delete', () => {
    describe('with paging', () => {
      it('should ignore paging args', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertDeleteSQL(
          {
            paging: {
              limit: 10,
              offset: 11,
            },
          },
          instance(mockWhereBuilder),
          '',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });
    });

    describe('with sorting', () => {
      it('should ignore sorting', () => {
        const mockWhereBuilder: WhereBuilder<TestEntity> = mock(WhereBuilder);
        assertDeleteSQL(
          {
            sorting: [
              { field: 'numberType', direction: SortDirection.ASC },
              { field: 'boolType', direction: SortDirection.DESC },
              { field: 'stringType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST },
              { field: 'dateType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST },
            ],
          },
          instance(mockWhereBuilder),
          '',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });
    });
  });
});
