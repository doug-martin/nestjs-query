import { anything, instance, mock, verify, when, deepEqual } from 'ts-mockito';
import { QueryBuilder, WhereExpression } from 'typeorm';
import { Class, Filter, Query, SortDirection, SortNulls } from '@codeshine/nestjs-query-core';
import { closeTestConnection, createTestConnection, getTestConnection } from '../__fixtures__/connection.fixture';
import { TestSoftDeleteEntity } from '../__fixtures__/test-soft-delete.entity';
import { TestEntity } from '../__fixtures__/test.entity';
import { FilterQueryBuilder, WhereBuilder } from '../../src/query';

describe('FilterQueryBuilder', (): void => {
  beforeEach(createTestConnection);
  afterEach(closeTestConnection);

  const getEntityQueryBuilder = <Entity>(
    entity: Class<Entity>,
    whereBuilder: WhereBuilder<Entity>,
  ): FilterQueryBuilder<Entity> => new FilterQueryBuilder(getTestConnection().getRepository(entity), whereBuilder);

  const expectSQLSnapshot = <Entity>(query: QueryBuilder<Entity>): void => {
    const [sql, params] = query.getQueryAndParameters();
    expect(sql).toMatchSnapshot();
    expect(params).toMatchSnapshot();
  };

  describe('#getReferencedRelationsRecursive', () => {
    it('with deeply nested and / or', () => {
      const complexQuery: Filter<TestEntity> = {
        and: [
          {
            or: [
              { and: [{ stringType: { eq: '123' } }] },
              {
                and: [{ stringType: { eq: '123' } }, { id: { gt: '123' } }],
              },
            ],
          },
          {
            stringType: { eq: '345' },
            or: [
              { oneTestRelation: { relationName: { eq: '123' } } },
              { oneTestRelation: { relationOfTestRelation: { testRelationId: { eq: 'e1' } } } },
            ],
          },
        ],
      };
      const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
      const qb = getEntityQueryBuilder(TestEntity, instance(mockWhereBuilder));
      expect(qb.getReferencedRelationsRecursive(qb.repo.metadata, complexQuery)).toEqual({
        oneTestRelation: { relationOfTestRelation: {} },
      });
    });
    it('with nested and / or', () => {
      const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
      const qb = getEntityQueryBuilder(TestEntity, instance(mockWhereBuilder));
      expect(
        qb.getReferencedRelationsRecursive(qb.repo.metadata, {
          test: '123',
          and: [
            {
              boolType: { is: true },
            },
            {
              testRelations: {
                relationName: { eq: '123' },
              },
            },
          ],
          or: [
            {
              boolType: { is: true },
            },
            {
              oneTestRelation: {
                testRelationPk: { eq: '123' },
              },
            },
            {
              oneTestRelation: {
                relationsOfTestRelation: {
                  testRelationId: {
                    eq: '123',
                  },
                },
              },
            },
          ],
        } as Filter<TestEntity>),
      ).toEqual({ testRelations: {}, oneTestRelation: { relationsOfTestRelation: {} } });
    });
  });

  describe('#select', () => {
    const expectSelectSQLSnapshot = (query: Query<TestEntity>, whereBuilder: WhereBuilder<TestEntity>): void => {
      const selectQueryBuilder = getEntityQueryBuilder(TestEntity, whereBuilder).select(query);
      expectSQLSnapshot(selectQueryBuilder);
    };

    describe('with filter', () => {
      it('should not call whereBuilder#build', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectSelectSQLSnapshot({}, instance(mockWhereBuilder));
        verify(mockWhereBuilder.build(anything(), anything(), { nested: {} }, 'TestEntity')).never();
      });

      it('should call whereBuilder#build if there is a filter', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        const query = { filter: { stringType: { eq: 'foo' } } };
        when(mockWhereBuilder.build(anything(), query.filter, deepEqual({ nested: {} }), 'TestEntity')).thenCall(
          (where: WhereExpression, field: Filter<TestEntity>, relationNames: string[], alias: string) =>
            where.andWhere(`${alias}.stringType = 'foo'`),
        );
        expectSelectSQLSnapshot(query, instance(mockWhereBuilder));
      });
    });

    describe('with paging', () => {
      it('should apply empty paging args', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectSelectSQLSnapshot({}, instance(mockWhereBuilder));
        verify(mockWhereBuilder.build(anything(), anything(), deepEqual({ nested: {} }), 'TestEntity')).never();
      });

      it('should apply paging args going forward', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectSelectSQLSnapshot({ paging: { limit: 10, offset: 11 } }, instance(mockWhereBuilder));
        verify(mockWhereBuilder.build(anything(), anything(), deepEqual({ nested: {} }), 'TestEntity')).never();
      });

      it('should apply paging args going backward', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectSelectSQLSnapshot({ paging: { limit: 10, offset: 10 } }, instance(mockWhereBuilder));
        verify(mockWhereBuilder.build(anything(), anything(), { nested: {} }, 'TestEntity')).never();
      });
    });

    describe('with sorting', () => {
      it('should apply ASC sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectSelectSQLSnapshot(
          { sorting: [{ field: 'numberType', direction: SortDirection.ASC }] },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), { nested: {} }, 'TestEntity')).never();
      });

      it('should apply ASC NULLS_FIRST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectSelectSQLSnapshot(
          { sorting: [{ field: 'numberType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST }] },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), { nested: {} }, 'TestEntity')).never();
      });

      it('should apply ASC NULLS_LAST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectSelectSQLSnapshot(
          { sorting: [{ field: 'numberType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }] },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), { nested: {} }, 'TestEntity')).never();
      });

      it('should apply DESC sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectSelectSQLSnapshot(
          { sorting: [{ field: 'numberType', direction: SortDirection.DESC }] },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), { nested: {} }, 'TestEntity')).never();
      });

      it('should apply DESC NULLS_FIRST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectSelectSQLSnapshot(
          { sorting: [{ field: 'numberType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_FIRST }] },
          instance(mockWhereBuilder),
        );
      });

      it('should apply DESC NULLS_LAST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectSelectSQLSnapshot(
          { sorting: [{ field: 'numberType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST }] },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), { nested: {} }, 'TestEntity')).never();
      });

      it('should apply multiple sorts', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectSelectSQLSnapshot(
          {
            sorting: [
              { field: 'numberType', direction: SortDirection.ASC },
              { field: 'boolType', direction: SortDirection.DESC },
              { field: 'stringType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST },
              { field: 'dateType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST },
            ],
          },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), { nested: {} }, 'TestEntity')).never();
      });
    });
  });

  describe('#update', () => {
    const expectUpdateSQLSnapshot = (query: Query<TestEntity>, whereBuilder: WhereBuilder<TestEntity>): void => {
      const queryBuilder = getEntityQueryBuilder(TestEntity, whereBuilder).update(query).set({ stringType: 'baz' });
      expectSQLSnapshot(queryBuilder);
    };

    describe('with filter', () => {
      it('should call whereBuilder#build if there is a filter', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        const query = { filter: { stringType: { eq: 'foo' } } };
        when(mockWhereBuilder.build(anything(), query.filter, deepEqual({ nested: {} }), undefined)).thenCall(
          (where: WhereExpression) => where.andWhere(`stringType = 'foo'`),
        );
        expectUpdateSQLSnapshot(query, instance(mockWhereBuilder));
      });
    });
    describe('with paging', () => {
      it('should ignore paging args', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectUpdateSQLSnapshot({ paging: { limit: 10, offset: 11 } }, instance(mockWhereBuilder));
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });
    });

    describe('with sorting', () => {
      it('should apply ASC sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectUpdateSQLSnapshot(
          { sorting: [{ field: 'numberType', direction: SortDirection.ASC }] },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });

      it('should apply ASC NULLS_FIRST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectUpdateSQLSnapshot(
          { sorting: [{ field: 'numberType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST }] },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });

      it('should apply ASC NULLS_LAST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectUpdateSQLSnapshot(
          { sorting: [{ field: 'numberType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }] },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });

      it('should apply DESC sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectUpdateSQLSnapshot(
          { sorting: [{ field: 'numberType', direction: SortDirection.DESC }] },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });

      it('should apply DESC NULLS_FIRST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectUpdateSQLSnapshot(
          { sorting: [{ field: 'numberType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_FIRST }] },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });

      it('should apply DESC NULLS_LAST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectUpdateSQLSnapshot(
          { sorting: [{ field: 'numberType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST }] },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });

      it('should apply multiple sorts', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectUpdateSQLSnapshot(
          {
            sorting: [
              { field: 'numberType', direction: SortDirection.ASC },
              { field: 'boolType', direction: SortDirection.DESC },
              { field: 'stringType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST },
              { field: 'dateType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST },
            ],
          },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });
    });
  });

  describe('#delete', () => {
    const expectDeleteSQLSnapshot = (query: Query<TestEntity>, whereBuilder: WhereBuilder<TestEntity>): void => {
      const selectQueryBuilder = getEntityQueryBuilder(TestEntity, whereBuilder).delete(query);
      expectSQLSnapshot(selectQueryBuilder);
    };

    describe('with filter', () => {
      it('should call whereBuilder#build if there is a filter', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        const query = { filter: { stringType: { eq: 'foo' } } };
        when(mockWhereBuilder.build(anything(), query.filter, deepEqual({ nested: {} }), undefined)).thenCall(
          (where: WhereExpression) => where.andWhere(`stringType = 'foo'`),
        );
        expectDeleteSQLSnapshot(query, instance(mockWhereBuilder));
      });
    });
    describe('with paging', () => {
      it('should ignore paging args', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectDeleteSQLSnapshot({ paging: { limit: 10, offset: 11 } }, instance(mockWhereBuilder));
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });
    });

    describe('with sorting', () => {
      it('should ignore sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectDeleteSQLSnapshot(
          {
            sorting: [
              { field: 'numberType', direction: SortDirection.ASC },
              { field: 'boolType', direction: SortDirection.DESC },
              { field: 'stringType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST },
              { field: 'dateType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST },
            ],
          },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });
    });
  });

  describe('#softDelete', () => {
    const expectSoftDeleteSQLSnapshot = (
      query: Query<TestSoftDeleteEntity>,
      whereBuilder: WhereBuilder<TestSoftDeleteEntity>,
    ): void => {
      const selectQueryBuilder = getEntityQueryBuilder(TestSoftDeleteEntity, whereBuilder).softDelete(query);
      expectSQLSnapshot(selectQueryBuilder);
    };

    describe('with filter', () => {
      it('should call whereBuilder#build if there is a filter', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestSoftDeleteEntity>>(WhereBuilder);
        const query = { filter: { stringType: { eq: 'foo' } } };
        when(mockWhereBuilder.build(anything(), query.filter, deepEqual({ nested: {} }), undefined)).thenCall(
          (where: WhereExpression) => where.andWhere(`stringType = 'foo'`),
        );
        expectSoftDeleteSQLSnapshot(query, instance(mockWhereBuilder));
      });
    });
    describe('with paging', () => {
      it('should ignore paging args', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestSoftDeleteEntity>>(WhereBuilder);
        expectSoftDeleteSQLSnapshot({ paging: { limit: 10, offset: 11 } }, instance(mockWhereBuilder));
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });
    });

    describe('with sorting', () => {
      it('should ignore sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestSoftDeleteEntity>>(WhereBuilder);
        expectSoftDeleteSQLSnapshot(
          {
            sorting: [
              { field: 'stringType', direction: SortDirection.ASC },
              { field: 'testEntityPk', direction: SortDirection.DESC },
            ],
          },
          instance(mockWhereBuilder),
        );
        verify(mockWhereBuilder.build(anything(), anything(), anything())).never();
      });
    });
  });
});
