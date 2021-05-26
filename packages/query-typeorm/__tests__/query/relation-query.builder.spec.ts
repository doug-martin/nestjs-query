import { Class, Query, SortDirection, SortNulls } from '@nestjs-query/core';
import { closeTestConnection, createTestConnection, getTestConnection } from '../__fixtures__/connection.fixture';
import { TestRelation } from '../__fixtures__/test-relation.entity';
import { TestEntity } from '../__fixtures__/test.entity';
import { RelationQueryBuilder } from '../../src/query';

describe('RelationQueryBuilder', (): void => {
  beforeEach(createTestConnection);
  afterEach(closeTestConnection);

  const getRelationQueryBuilder = <Entity, Relation>(
    EntityClass: Class<Entity>,
    relationName: string,
  ): RelationQueryBuilder<Entity, Relation> =>
    new RelationQueryBuilder(getTestConnection().getRepository(EntityClass), relationName);

  const expectSQLSnapshot = <Entity, Relation>(
    EntityClass: Class<Entity>,
    entity: Entity,
    relation: string,
    query: Query<Relation>,
  ): void => {
    const selectQueryBuilder = getRelationQueryBuilder<Entity, Relation>(EntityClass, relation).select(entity, query);
    const [sql, params] = selectQueryBuilder.getQueryAndParameters();
    expect(sql).toMatchSnapshot();
    expect(params).toMatchSnapshot();
  };

  describe('#select', () => {
    const testEntity: TestEntity = {
      testEntityPk: 'test-entity-id-1',
      dateType: new Date(),
      boolType: true,
      numberType: 1,
      stringType: 'str',
    };

    const testRelation: TestRelation = {
      testRelationPk: 'test-relation-id-1',
      relationName: 'relation-name',
    };

    it('should throw an error if there is no relation with that name', () => {
      expect(() => {
        expectSQLSnapshot(TestEntity, testEntity, 'badRelations', {});
      }).toThrow("Unable to find entity for relation 'badRelations'");
    });

    describe('one to many', () => {
      it('should query with a single entity', () => {
        expectSQLSnapshot(TestEntity, testEntity, 'testRelations', {});
      });
    });

    describe('many to one', () => {
      it('should work with one entity', () => {
        expectSQLSnapshot(TestRelation, testRelation, 'testEntity', {});
      });

      it('should work with a uni-directional relationship', () => {
        expectSQLSnapshot(TestRelation, testRelation, 'testEntityUniDirectional', {});
      });
    });

    describe('many to many', () => {
      describe('on owning side', () => {
        it('should work with one entity', () => {
          expectSQLSnapshot(TestEntity, testEntity, 'manyTestRelations', {});
        });
      });

      describe('on non owning side', () => {
        it('should work with many to many', () => {
          expectSQLSnapshot(TestRelation, testRelation, 'manyTestEntities', {});
        });
      });

      describe('many-to-many custom join table', () => {
        it('should work with a many-to-many through a join table', () => {
          expectSQLSnapshot(TestEntity, testEntity, 'testEntityRelation', {});
        });
      });

      describe('uni-directional many to many', () => {
        it('should create the correct sql', () => {
          expectSQLSnapshot(TestEntity, testEntity, 'manyToManyUniDirectional', {});
        });
      });
    });

    describe('one to one', () => {
      it('on owning side', () => {
        expectSQLSnapshot(TestEntity, testEntity, 'oneTestRelation', {});
      });

      it('on non owning side', () => {
        expectSQLSnapshot(TestRelation, testRelation, 'oneTestEntity', {});
      });
    });

    describe('with filter', () => {
      it('should call whereBuilder#build if there is a filter', () => {
        const query: Query<TestRelation> = { filter: { relationName: { eq: 'foo' } } };
        expectSQLSnapshot(TestEntity, testEntity, 'testRelations', query);
      });
    });

    describe('with paging', () => {
      it('should apply paging args going forward', () => {
        expectSQLSnapshot(TestEntity, testEntity, 'testRelations', { paging: { limit: 10, offset: 11 } });
      });

      it('should apply paging args going backward', () => {
        expectSQLSnapshot(TestEntity, testEntity, 'testRelations', { paging: { limit: 10, offset: 10 } });
      });
    });

    describe('with sorting', () => {
      it('should apply ASC sorting', () => {
        expectSQLSnapshot(TestEntity, testEntity, 'testRelations', {
          sorting: [{ field: 'relationName', direction: SortDirection.ASC }],
        });
      });

      it('should apply ASC NULLS_FIRST sorting', () => {
        expectSQLSnapshot(TestEntity, testEntity, 'testRelations', {
          sorting: [{ field: 'relationName', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST }],
        });
      });

      it('should apply ASC NULLS_LAST sorting', () => {
        expectSQLSnapshot(TestEntity, testEntity, 'testRelations', {
          sorting: [{ field: 'relationName', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
        });
      });

      it('should apply DESC sorting', () => {
        expectSQLSnapshot(TestEntity, testEntity, 'testRelations', {
          sorting: [{ field: 'relationName', direction: SortDirection.DESC }],
        });
      });

      it('should apply DESC NULLS_FIRST sorting', () => {
        expectSQLSnapshot(TestEntity, testEntity, 'testRelations', {
          sorting: [{ field: 'relationName', direction: SortDirection.DESC, nulls: SortNulls.NULLS_FIRST }],
        });
      });

      it('should apply DESC NULLS_LAST sorting', () => {
        expectSQLSnapshot(TestEntity, testEntity, 'testRelations', {
          sorting: [{ field: 'relationName', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST }],
        });
      });

      it('should apply multiple sorts', () => {
        expectSQLSnapshot(TestEntity, testEntity, 'testRelations', {
          sorting: [
            { field: 'relationName', direction: SortDirection.ASC },
            { field: 'testRelationPk', direction: SortDirection.DESC },
          ],
        });
      });
    });
  });
});
