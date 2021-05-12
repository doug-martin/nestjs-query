import { anything, instance, mock, verify, when, deepEqual } from 'ts-mockito';
import { QueryBuilder, WhereExpression } from 'typeorm';
import { Class, Filter, Query, SortDirection, SortNulls } from '@nestjs-query/core';
import { closeTestConnection, createTestConnection, getTestConnection } from '../__fixtures__/connection.fixture';
import { TestSoftDeleteEntity } from '../__fixtures__/test-soft-delete.entity';
import { TestEntity } from '../__fixtures__/test.entity';
import { FilterQueryBuilder, WhereBuilder } from '../../src/query';

describe('FilterQueryBuilder', (): void => {
  beforeEach(createTestConnection);
  afterEach(closeTestConnection);

  const baseSelectQuery =
    `SELECT` +
    ` "TestEntity"."test_entity_pk" AS "TestEntity_test_entity_pk",` +
    ` "TestEntity"."string_type" AS "TestEntity_string_type",` +
    ` "TestEntity"."bool_type" AS "TestEntity_bool_type",` +
    ` "TestEntity"."number_type" AS "TestEntity_number_type",` +
    ` "TestEntity"."date_type" AS "TestEntity_date_type",` +
    ` "TestEntity"."oneTestRelationTestRelationPk" AS "TestEntity_oneTestRelationTestRelationPk"` +
    ` FROM "test_entity" "TestEntity"`;

  const baseUpdateQuery = 'UPDATE "test_entity" SET "string_type" = ?';

  const baseDeleteQuery = 'DELETE FROM "test_entity"';

  const baseSoftDeleteQuery = 'UPDATE "test_soft_delete_entity" SET "deleted_at" = CURRENT_TIMESTAMP';

  const getEntityQueryBuilder = <Entity>(
    entity: Class<Entity>,
    whereBuilder: WhereBuilder<Entity>,
  ): FilterQueryBuilder<Entity> => new FilterQueryBuilder(getTestConnection().getRepository(entity), whereBuilder);

  const assertSQL = <Entity>(query: QueryBuilder<Entity>, expectedSql: string, expectedArgs: any[]): void => {
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
    const selectQueryBuilder = getEntityQueryBuilder(TestEntity, whereBuilder).select(query);
    assertSQL(selectQueryBuilder, `${baseSelectQuery}${expectedSql}`, expectedArgs);
  };

  const assertDeleteSQL = (
    query: Query<TestEntity>,
    whereBuilder: WhereBuilder<TestEntity>,
    expectedSql: string,
    expectedArgs: any[],
  ): void => {
    const selectQueryBuilder = getEntityQueryBuilder(TestEntity, whereBuilder).delete(query);
    assertSQL(selectQueryBuilder, `${baseDeleteQuery}${expectedSql}`, expectedArgs);
  };

  const assertSoftDeleteSQL = (
    query: Query<TestSoftDeleteEntity>,
    whereBuilder: WhereBuilder<TestSoftDeleteEntity>,
    expectedSql: string,
    expectedArgs: any[],
  ): void => {
    const selectQueryBuilder = getEntityQueryBuilder(TestSoftDeleteEntity, whereBuilder).softDelete(query);
    assertSQL(selectQueryBuilder, `${baseSoftDeleteQuery}${expectedSql}`, expectedArgs);
  };

  const assertUpdateSQL = (
    query: Query<TestEntity>,
    whereBuilder: WhereBuilder<TestEntity>,
    expectedSql: string,
    expectedArgs: any[],
  ): void => {
    const queryBuilder = getEntityQueryBuilder(TestEntity, whereBuilder).update(query).set({ stringType: 'baz' });
    assertSQL(queryBuilder, `${baseUpdateQuery}${expectedSql}`, ['baz', ...expectedArgs]);
  };

  describe('#select', () => {
    describe('with filter', () => {
      it('should not call whereBuilder#build', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        assertSelectSQL({}, instance(mockWhereBuilder), '', []);
        verify(mockWhereBuilder.build(anything(), anything(), [], 'TestEntity')).never();
      });

      it('should call whereBuilder#build if there is a filter', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        const query = { filter: { stringType: { eq: 'foo' } } };
        when(mockWhereBuilder.build(anything(), query.filter, deepEqual([]), 'TestEntity')).thenCall(
          (where: WhereExpression, field: Filter<TestEntity>, relationNames: string[], alias: string) =>
            where.andWhere(`${alias}.stringType = 'foo'`),
        );
        assertSelectSQL(query, instance(mockWhereBuilder), ` WHERE "TestEntity"."string_type" = 'foo'`, []);
      });
    });

    describe('with paging', () => {
      it('should apply empty paging args', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        assertSelectSQL({}, instance(mockWhereBuilder), '', []);
        verify(mockWhereBuilder.build(anything(), anything(), deepEqual([]), 'TestEntity')).never();
      });

      it('should apply paging args going forward', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
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
        verify(mockWhereBuilder.build(anything(), anything(), deepEqual([]), 'TestEntity')).never();
      });

      it('should apply paging args going backward', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
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
        verify(mockWhereBuilder.build(anything(), anything(), [], 'TestEntity')).never();
      });
    });

    describe('with sorting', () => {
      it('should apply ASC sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        assertSelectSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "TestEntity"."number_type" ASC',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything(), [], 'TestEntity')).never();
      });

      it('should apply ASC NULLS_FIRST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        assertSelectSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "TestEntity"."number_type" ASC NULLS FIRST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything(), [], 'TestEntity')).never();
      });

      it('should apply ASC NULLS_LAST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        assertSelectSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "TestEntity"."number_type" ASC NULLS LAST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything(), [], 'TestEntity')).never();
      });

      it('should apply DESC sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        assertSelectSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "TestEntity"."number_type" DESC',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything(), [], 'TestEntity')).never();
      });

      it('should apply DESC NULLS_FIRST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        assertSelectSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_FIRST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "TestEntity"."number_type" DESC NULLS FIRST',
          [],
        );
      });

      it('should apply DESC NULLS_LAST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        assertSelectSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "TestEntity"."number_type" DESC NULLS LAST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything(), [], 'TestEntity')).never();
      });

      it('should apply multiple sorts', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
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
          ' ORDER BY "TestEntity"."number_type" ASC, "TestEntity"."bool_type" DESC, "TestEntity"."string_type" ASC' +
            ' NULLS FIRST, "TestEntity"."date_type" DESC NULLS LAST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything(), [], 'TestEntity')).never();
      });
    });
  });

  describe('#update', () => {
    describe('with filter', () => {
      it('should call whereBuilder#build if there is a filter', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        const query = { filter: { stringType: { eq: 'foo' } } };
        when(mockWhereBuilder.build(anything(), query.filter, deepEqual([]), undefined)).thenCall(
          (where: WhereExpression) => where.andWhere(`stringType = 'foo'`),
        );
        assertUpdateSQL(query, instance(mockWhereBuilder), ` WHERE "string_type" = 'foo'`, []);
      });
    });
    describe('with paging', () => {
      it('should ignore paging args', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
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
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });
    });

    describe('with sorting', () => {
      it('should apply ASC sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        assertUpdateSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" ASC',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });

      it('should apply ASC NULLS_FIRST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        assertUpdateSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" ASC NULLS FIRST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });

      it('should apply ASC NULLS_LAST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        assertUpdateSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" ASC NULLS LAST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });

      it('should apply DESC sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        assertUpdateSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" DESC',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });

      it('should apply DESC NULLS_FIRST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        assertUpdateSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_FIRST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" DESC NULLS FIRST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });

      it('should apply DESC NULLS_LAST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        assertUpdateSQL(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST }],
          },
          instance(mockWhereBuilder),
          ' ORDER BY "number_type" DESC NULLS LAST',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });

      it('should apply multiple sorts', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
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
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });
    });
  });

  describe('#delete', () => {
    describe('with filter', () => {
      it('should call whereBuilder#build if there is a filter', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        const query = { filter: { stringType: { eq: 'foo' } } };
        when(mockWhereBuilder.build(anything(), query.filter, deepEqual([]), undefined)).thenCall(
          (where: WhereExpression) => where.andWhere(`stringType = 'foo'`),
        );
        assertDeleteSQL(query, instance(mockWhereBuilder), ` WHERE "string_type" = 'foo'`, []);
      });
    });
    describe('with paging', () => {
      it('should ignore paging args', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
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
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });
    });

    describe('with sorting', () => {
      it('should ignore sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
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
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });
    });
  });

  describe('#softDelete', () => {
    describe('with filter', () => {
      it('should call whereBuilder#build if there is a filter', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestSoftDeleteEntity>>(WhereBuilder);
        const query = { filter: { stringType: { eq: 'foo' } } };
        when(mockWhereBuilder.build(anything(), query.filter, deepEqual([]), undefined)).thenCall(
          (where: WhereExpression) => where.andWhere(`stringType = 'foo'`),
        );
        assertSoftDeleteSQL(query, instance(mockWhereBuilder), ` WHERE "string_type" = 'foo'`, []);
      });
    });
    describe('with paging', () => {
      it('should ignore paging args', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestSoftDeleteEntity>>(WhereBuilder);
        assertSoftDeleteSQL(
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
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });
    });

    describe('with sorting', () => {
      it('should ignore sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestSoftDeleteEntity>>(WhereBuilder);
        assertSoftDeleteSQL(
          {
            sorting: [
              { field: 'stringType', direction: SortDirection.ASC },
              { field: 'testEntityPk', direction: SortDirection.DESC },
            ],
          },
          instance(mockWhereBuilder),
          '',
          [],
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });
    });
  });
});
