import { QueryBuilder } from 'typeorm';
import { Class, Query, SortDirection, SortNulls } from '@nestjs-query/core';
import { closeTestConnection, createTestConnection, getTestConnection } from '../__fixtures__/connection.fixture';
import { TestRelation } from '../__fixtures__/test-relation.entity';
import { TestEntity } from '../__fixtures__/test.entity';
import { RelationQueryBuilder } from '../../src/query';

describe('RelationQueryBuilder', (): void => {
  beforeEach(createTestConnection);
  afterEach(closeTestConnection);

  const manyToOneSelect =
    `SELECT` +
    ` "testEntity"."testEntityPk" AS "testEntity_testEntityPk",` +
    ` "testEntity"."string_type" AS "testEntity_string_type",` +
    ` "testEntity"."bool_type" AS "testEntity_bool_type",` +
    ` "testEntity"."number_type" AS "testEntity_number_type",` +
    ` "testEntity"."date_type" AS "testEntity_date_type",` +
    ` "testEntity"."oneTestRelationTestRelationPk" AS "testEntity_oneTestRelationTestRelationPk"` +
    ` FROM "test_entity" "testEntity"` +
    ` INNER JOIN "test_relation" "TestRelation" ON "TestRelation"."test_entity_id" = "testEntity"."testEntityPk"` +
    ` WHERE ("TestRelation"."testRelationPk" = ?)`;

  const manyToManyNonOwnerSelectQuery =
    `SELECT` +
    ` "manyTestEntities"."testEntityPk" AS "manyTestEntities_testEntityPk",` +
    ` "manyTestEntities"."string_type" AS "manyTestEntities_string_type",` +
    ` "manyTestEntities"."bool_type" AS "manyTestEntities_bool_type",` +
    ` "manyTestEntities"."number_type" AS "manyTestEntities_number_type",` +
    ` "manyTestEntities"."date_type" AS "manyTestEntities_date_type",` +
    ` "manyTestEntities"."oneTestRelationTestRelationPk" AS "manyTestEntities_oneTestRelationTestRelationPk"` +
    ` FROM "test_entity" "manyTestEntities"` +
    ` INNER JOIN "test_entity_many_test_relations_test_relation" "test_entity_many_test_relations_test_relation" ON "test_entity_many_test_relations_test_relation"."testEntityTestEntityPk" = "manyTestEntities"."testEntityPk"` +
    ' WHERE ("test_entity_many_test_relations_test_relation"."testRelationTestRelationPk" = ?)';

  const oneToManySelect =
    `SELECT` +
    ` "testRelations"."testRelationPk" AS "testRelations_testRelationPk",` +
    ` "testRelations"."relation_name" AS "testRelations_relation_name",` +
    ` "testRelations"."test_entity_id" AS "testRelations_test_entity_id"` +
    ` FROM "test_relation" "testRelations"` +
    ' WHERE ("testRelations"."test_entity_id" = ?)';

  const manyToManyOwnerSelect =
    'SELECT ' +
    `"manyTestRelations"."testRelationPk" AS "manyTestRelations_testRelationPk",` +
    ' "manyTestRelations"."relation_name" AS "manyTestRelations_relation_name",' +
    ' "manyTestRelations"."test_entity_id" AS "manyTestRelations_test_entity_id"' +
    ` FROM "test_relation" "manyTestRelations"` +
    ` INNER JOIN "test_entity_many_test_relations_test_relation" "test_entity_many_test_relations_test_relation" ON "test_entity_many_test_relations_test_relation"."testRelationTestRelationPk" = "manyTestRelations"."testRelationPk"` +
    ' WHERE ("test_entity_many_test_relations_test_relation"."testEntityTestEntityPk" = ?)';

  const oneToOneOwnerSelect =
    `SELECT` +
    ` "oneTestRelation"."testRelationPk" AS "oneTestRelation_testRelationPk",` +
    ` "oneTestRelation"."relation_name" AS "oneTestRelation_relation_name",` +
    ` "oneTestRelation"."test_entity_id" AS "oneTestRelation_test_entity_id"` +
    ` FROM "test_relation" "oneTestRelation"` +
    ` INNER JOIN "test_entity" "TestEntity" ON "TestEntity"."oneTestRelationTestRelationPk" = "oneTestRelation"."testRelationPk"` +
    ' WHERE ("TestEntity"."testEntityPk" = ?)';

  const oneToOneNonOwnerSelect =
    `SELECT` +
    ` "oneTestEntity"."testEntityPk" AS "oneTestEntity_testEntityPk",` +
    ` "oneTestEntity"."string_type" AS "oneTestEntity_string_type",` +
    ` "oneTestEntity"."bool_type" AS "oneTestEntity_bool_type",` +
    ` "oneTestEntity"."number_type" AS "oneTestEntity_number_type",` +
    ` "oneTestEntity"."date_type" AS "oneTestEntity_date_type",` +
    ` "oneTestEntity"."oneTestRelationTestRelationPk" AS "oneTestEntity_oneTestRelationTestRelationPk"` +
    ` FROM "test_entity" "oneTestEntity"` +
    ' WHERE ("oneTestEntity"."oneTestRelationTestRelationPk" = ?)';

  const manyToManyCustomJoinSelect =
    `SELECT ` +
    `"testEntityRelation"."test_relation_id" AS "testEntityRelation_test_relation_id",` +
    ` "testEntityRelation"."test_entity_id" AS "testEntityRelation_test_entity_id"` +
    ` FROM "test_entity_relation_entity" "testEntityRelation"` +
    ` WHERE ("testEntityRelation"."test_entity_id" = ?)`;

  const getRelationQueryBuilder = <Entity, Relation>(
    EntityClass: Class<Entity>,
    relationName: string,
  ): RelationQueryBuilder<Entity, Relation> =>
    new RelationQueryBuilder(getTestConnection().getRepository(EntityClass), relationName);

  const assertSQL = <Entity>(query: QueryBuilder<Entity>, expectedSql: string, expectedArgs: any[]): void => {
    const [sql, params] = query.getQueryAndParameters();
    expect(sql).toEqual(expectedSql);
    expect(params).toEqual(expectedArgs);
  };

  const createSQLAsserter = <Entity>(EntityClass: Class<Entity>, baseSQL: string) => <Relation>(
    entity: Entity,
    relation: string,
    query: Query<Relation>,
    expectedSql: string,
    expectedArgs: any[],
  ): void => {
    const selectQueryBuilder = getRelationQueryBuilder<Entity, Relation>(EntityClass, relation).select(entity, query);
    assertSQL(selectQueryBuilder, `${baseSQL}${expectedSql}`, expectedArgs);
  };

  const assertOneToManySQL = createSQLAsserter(TestEntity, oneToManySelect);

  const assertManyToManyOwnerSQL = createSQLAsserter(TestEntity, manyToManyOwnerSelect);

  const assertManyToOneSQL = createSQLAsserter(TestRelation, manyToOneSelect);

  const assertManyToManyNonOwnerSQL = createSQLAsserter(TestRelation, manyToManyNonOwnerSelectQuery);

  const assertOneToOneOwnerSQL = createSQLAsserter(TestEntity, oneToOneOwnerSelect);

  const assertOneToOneNonOwnerSQL = createSQLAsserter(TestRelation, oneToOneNonOwnerSelect);

  const assertManyToManyCustomJoinSQL = createSQLAsserter(TestEntity, manyToManyCustomJoinSelect);

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
        assertOneToManySQL(testEntity, 'badRelations', {}, '', []);
      }).toThrow("Unable to find entity for relation 'badRelations'");
    });

    describe('one to many', () => {
      it('should query with a single entity', () => {
        assertOneToManySQL(testEntity, 'testRelations', {}, ``, [testEntity.testEntityPk]);
      });
    });

    describe('many to one', () => {
      it('should work with one entity', () => {
        assertManyToOneSQL(testRelation, 'testEntity', {}, ``, [testRelation.testRelationPk]);
      });
    });

    describe('many to many', () => {
      describe('on owning side', () => {
        it('should work with one entity', () => {
          assertManyToManyOwnerSQL(testEntity, 'manyTestRelations', {}, ``, [testEntity.testEntityPk]);
        });
      });

      describe('on non owning side', () => {
        it('should work with many to many', () => {
          assertManyToManyNonOwnerSQL(testRelation, 'manyTestEntities', {}, ``, [testRelation.testRelationPk]);
        });
      });

      describe('many-to-many custom join table', () => {
        it('should work with a many-to-many through a join table', () => {
          assertManyToManyCustomJoinSQL(testEntity, 'testEntityRelation', {}, ``, [testEntity.testEntityPk]);
        });
      });
    });

    describe('one to one', () => {
      it('on owning side', () => {
        assertOneToOneOwnerSQL(testEntity, 'oneTestRelation', {}, ``, [testEntity.testEntityPk]);
      });

      it('on non owning side', () => {
        assertOneToOneNonOwnerSQL(testRelation, 'oneTestEntity', {}, ``, [testRelation.testRelationPk]);
      });
    });

    describe('with filter', () => {
      it('should call whereBuilder#build if there is a filter', () => {
        const query: Query<TestRelation> = { filter: { relationName: { eq: 'foo' } } };
        assertOneToManySQL(testEntity, 'testRelations', query, ` AND ("testRelations"."relation_name" = ?)`, [
          testEntity.testEntityPk,
          'foo',
        ]);
      });
    });

    describe('with paging', () => {
      it('should apply paging args going forward', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            paging: {
              limit: 10,
              offset: 11,
            },
          },
          ` LIMIT 10 OFFSET 11`,
          [testEntity.testEntityPk],
        );
      });

      it('should apply paging args going backward', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            paging: {
              limit: 10,
              offset: 10,
            },
          },
          ` LIMIT 10 OFFSET 10`,
          [testEntity.testEntityPk],
        );
      });
    });

    describe('with sorting', () => {
      it('should apply ASC sorting', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            sorting: [{ field: 'relationName', direction: SortDirection.ASC }],
          },
          ` ORDER BY "testRelations"."relation_name" ASC`,
          [testEntity.testEntityPk],
        );
      });

      it('should apply ASC NULLS_FIRST sorting', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            sorting: [{ field: 'relationName', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST }],
          },
          ` ORDER BY "testRelations"."relation_name" ASC NULLS FIRST`,
          [testEntity.testEntityPk],
        );
      });

      it('should apply ASC NULLS_LAST sorting', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            sorting: [{ field: 'relationName', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
          },
          ` ORDER BY "testRelations"."relation_name" ASC NULLS LAST`,
          [testEntity.testEntityPk],
        );
      });

      it('should apply DESC sorting', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            sorting: [{ field: 'relationName', direction: SortDirection.DESC }],
          },
          ` ORDER BY "testRelations"."relation_name" DESC`,
          [testEntity.testEntityPk],
        );
      });

      it('should apply DESC NULLS_FIRST sorting', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            sorting: [{ field: 'relationName', direction: SortDirection.DESC, nulls: SortNulls.NULLS_FIRST }],
          },
          ` ORDER BY "testRelations"."relation_name" DESC NULLS FIRST`,
          [testEntity.testEntityPk],
        );
      });

      it('should apply DESC NULLS_LAST sorting', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            sorting: [{ field: 'relationName', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST }],
          },
          ` ORDER BY "testRelations"."relation_name" DESC NULLS LAST`,
          [testEntity.testEntityPk],
        );
      });

      it('should apply multiple sorts', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            sorting: [
              { field: 'relationName', direction: SortDirection.ASC },
              { field: 'testRelationPk', direction: SortDirection.DESC },
            ],
          },
          ` ORDER BY "testRelations"."relation_name" ASC, "testRelations"."testRelationPk" DESC`,
          [testEntity.testEntityPk],
        );
      });
    });
  });
});
