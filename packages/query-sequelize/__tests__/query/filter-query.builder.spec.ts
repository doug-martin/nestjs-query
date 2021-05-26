import { FindOptions, Op, UpdateOptions, DestroyOptions } from 'sequelize';
import { anything, instance, mock, verify, when, deepEqual } from 'ts-mockito';
import { Query, SortDirection, SortNulls } from '@nestjs-query/core';
import { TestEntity } from '../__fixtures__/test.entity';
import { FilterQueryBuilder, WhereBuilder } from '../../src/query';

describe('FilterQueryBuilder', (): void => {
  const getEntityQueryBuilder = (whereBuilder: WhereBuilder<TestEntity>): FilterQueryBuilder<TestEntity> =>
    new FilterQueryBuilder(TestEntity, whereBuilder);

  describe('#select', () => {
    const expectFindOptions = (
      query: Query<TestEntity>,
      whereBuilder: WhereBuilder<TestEntity>,
      expectedFindOptions: FindOptions,
    ): void => {
      expect(getEntityQueryBuilder(whereBuilder).findOptions(query)).toEqual({
        ...expectedFindOptions,
        subQuery: false,
      });
    };

    describe('with filter', () => {
      it('should not call whereBuilder#build', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectFindOptions({}, instance(mockWhereBuilder), {});
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should call whereBuilder#build if there is a filter', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        const query = { filter: { stringType: { eq: 'foo' } } };
        when(mockWhereBuilder.build(query.filter, deepEqual(new Map()))).thenCall(() => ({
          [Op.and]: { stringType: 'foo' },
        }));
        expectFindOptions(query, instance(mockWhereBuilder), {
          where: { [Op.and]: { stringType: 'foo' } },
        });
      });
    });

    describe('with paging', () => {
      it('should apply empty paging args', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectFindOptions({}, instance(mockWhereBuilder), {});
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply paging args going forward', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectFindOptions(
          {
            paging: {
              limit: 10,
              offset: 11,
            },
          },
          instance(mockWhereBuilder),
          { limit: 10, offset: 11 },
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply paging args going backward', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectFindOptions(
          {
            paging: {
              limit: 10,
              offset: 10,
            },
          },
          instance(mockWhereBuilder),
          { limit: 10, offset: 10 },
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply paging with just a limit', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectFindOptions(
          {
            paging: {
              limit: 10,
            },
          },
          instance(mockWhereBuilder),
          { limit: 10 },
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply paging with just an offset', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectFindOptions(
          {
            paging: {
              offset: 10,
            },
          },
          instance(mockWhereBuilder),
          { offset: 10 },
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });
    });

    describe('with sorting', () => {
      it('should apply ASC sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectFindOptions(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC }],
          },
          instance(mockWhereBuilder),
          { order: [['numberType', 'ASC']] },
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply ASC NULLS_FIRST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectFindOptions(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST }],
          },
          instance(mockWhereBuilder),
          { order: [['numberType', 'ASC NULLS FIRST']] },
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply ASC NULLS_LAST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectFindOptions(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
          },
          instance(mockWhereBuilder),
          { order: [['numberType', 'ASC NULLS LAST']] },
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply DESC sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectFindOptions(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC }],
          },
          instance(mockWhereBuilder),
          { order: [['numberType', 'DESC']] },
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply DESC NULLS_FIRST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectFindOptions(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_FIRST }],
          },
          instance(mockWhereBuilder),
          { order: [['numberType', 'DESC NULLS FIRST']] },
        );
      });

      it('should apply DESC NULLS_LAST sorting', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectFindOptions(
          {
            sorting: [{ field: 'numberType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST }],
          },
          instance(mockWhereBuilder),
          { order: [['numberType', 'DESC NULLS LAST']] },
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });

      it('should apply multiple sorts', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectFindOptions(
          {
            sorting: [
              { field: 'numberType', direction: SortDirection.ASC },
              { field: 'boolType', direction: SortDirection.DESC },
              { field: 'stringType', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST },
              { field: 'dateType', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST },
            ],
          },
          instance(mockWhereBuilder),
          {
            order: [
              ['numberType', 'ASC'],
              ['boolType', 'DESC'],
              ['stringType', 'ASC NULLS FIRST'],
              ['dateType', 'DESC NULLS LAST'],
            ],
          },
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });
    });
  });

  describe('#update', () => {
    const expectUpdateOptions = (
      query: Query<TestEntity>,
      whereBuilder: WhereBuilder<TestEntity>,
      expectedUpdateOptions: UpdateOptions,
    ): void => {
      expect(getEntityQueryBuilder(whereBuilder).updateOptions(query)).toEqual(expectedUpdateOptions);
    };

    describe('with filter', () => {
      it('should call whereBuilder#build if there is a filter', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        const query = { filter: { stringType: { eq: 'foo' } } };
        when(mockWhereBuilder.build(query.filter, deepEqual(new Map()))).thenCall(() => ({
          [Op.and]: { stringType: 'foo' },
        }));
        expectUpdateOptions(query, instance(mockWhereBuilder), {
          where: { [Op.and]: { stringType: 'foo' } },
        });
      });
    });
    describe('with paging', () => {
      it('should ignore paging args', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectUpdateOptions(
          {
            paging: {
              limit: 10,
            },
          },
          instance(mockWhereBuilder),
          { where: {}, limit: 10 },
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });
    });
  });

  describe('#delete', () => {
    const expectDestroyOptions = (
      query: Query<TestEntity>,
      whereBuilder: WhereBuilder<TestEntity>,
      expectedDestroyOptions: DestroyOptions,
    ): void => {
      expect(getEntityQueryBuilder(whereBuilder).destroyOptions(query)).toEqual(expectedDestroyOptions);
    };

    describe('with filter', () => {
      it('should call whereBuilder#build if there is a filter', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        const query = { filter: { stringType: { eq: 'foo' } } };
        when(mockWhereBuilder.build(query.filter, deepEqual(new Map()))).thenCall(() => ({
          [Op.and]: { stringType: 'foo' },
        }));
        expectDestroyOptions(query, instance(mockWhereBuilder), {
          where: { [Op.and]: { stringType: 'foo' } },
        });
      });
    });
    describe('with paging', () => {
      it('should include limit', () => {
        const mockWhereBuilder = mock<WhereBuilder<TestEntity>>(WhereBuilder);
        expectDestroyOptions(
          {
            paging: {
              limit: 10,
            },
          },
          instance(mockWhereBuilder),
          { limit: 10 },
        );
        verify(mockWhereBuilder.build(anything(), anything())).never();
      });
    });
  });
});
