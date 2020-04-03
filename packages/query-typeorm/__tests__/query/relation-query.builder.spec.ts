import { QueryBuilder } from 'typeorm';
import { Class, Query, SortDirection, SortNulls } from '@nestjs-query/core';
import { closeTestConnection, createTestConnection, getTestConnection } from '../__fixtures__/connection.fixture';
import { TestRelation } from '../__fixtures__/test-relation.entity';
import { TestEntity } from '../__fixtures__/test.entity';
import { RelationQueryBuilder } from '../../src/query';

describe('RelationQueryBuilder', (): void => {
  beforeEach(createTestConnection);
  afterEach(closeTestConnection);

  const baseManyToOneFrom =
    ` FROM "test_entity" "testEntity"` +
    ` INNER JOIN "test_relation" "TestRelation" ON "TestRelation"."test_entity_id" = "testEntity"."testEntityPk"`;

  const manyToOneEntityClause = '"TestRelation"."testRelationPk" = ?';

  const baseManyToOneFromSubQuery = `"testEntity"."testEntityPk" IN (SELECT "testEntity"."testEntityPk" AS "testEntity_testEntityPk"${baseManyToOneFrom} WHERE ${manyToOneEntityClause})`;

  const manyToOneOrderBy = `ORDER BY "TestRelation"."testRelationPk" ASC`;

  const orderByTestRelationsTestEntityId = `ORDER BY "testRelations"."test_entity_id" ASC`;

  const baseManyToOneSelect = `${
    `SELECT` +
    ` "testEntity"."testEntityPk" AS "testEntity_testEntityPk",` +
    ` "testEntity"."string_type" AS "testEntity_string_type",` +
    ` "testEntity"."bool_type" AS "testEntity_bool_type",` +
    ` "testEntity"."number_type" AS "testEntity_number_type",` +
    ` "testEntity"."date_type" AS "testEntity_date_type",` +
    ` "testEntity"."oneTestRelationTestRelationPk" AS "testEntity_oneTestRelationTestRelationPk",` +
    ` "TestRelation"."testRelationPk" AS "__nestjsQueryEntityId_testRelationPk__"`
  }${baseManyToOneFrom}`;

  const baseManyToManyNonOwnerSelectQueryFrom =
    ` FROM "test_entity" "manyTestEntities"` +
    ` INNER JOIN "test_entity_many_test_relations_test_relation" "test_entity_many_test_relations_test_relation" ON "test_entity_many_test_relations_test_relation"."testEntityTestEntityPk" = "manyTestEntities"."testEntityPk"`;

  const baseManyToManyNonOwnerSelectQuery = `${
    `SELECT` +
    ` "manyTestEntities"."testEntityPk" AS "manyTestEntities_testEntityPk",` +
    ` "manyTestEntities"."string_type" AS "manyTestEntities_string_type",` +
    ` "manyTestEntities"."bool_type" AS "manyTestEntities_bool_type",` +
    ` "manyTestEntities"."number_type" AS "manyTestEntities_number_type",` +
    ` "manyTestEntities"."date_type" AS "manyTestEntities_date_type",` +
    ` "manyTestEntities"."oneTestRelationTestRelationPk" AS "manyTestEntities_oneTestRelationTestRelationPk",` +
    ` "test_entity_many_test_relations_test_relation"."testRelationTestRelationPk" AS "__nestjsQueryEntityId_testRelationPk__"`
  }${baseManyToManyNonOwnerSelectQueryFrom}`;

  const manyToManyNonOwnerEntityClause =
    '"test_entity_many_test_relations_test_relation"."testRelationTestRelationPk" = ?';

  const manyToManyNonOwnerInSubQuery = `"manyTestEntities"."testEntityPk" IN (SELECT "manyTestEntities"."testEntityPk" AS "manyTestEntities_testEntityPk"${baseManyToManyNonOwnerSelectQueryFrom} WHERE ${manyToManyNonOwnerEntityClause})`;

  const manyToManyOrderBy = `ORDER BY "test_entity_many_test_relations_test_relation"."testRelationTestRelationPk" ASC`;

  const baseOneToManySelect =
    `SELECT` +
    ` "testRelations"."testRelationPk" AS "testRelations_testRelationPk",` +
    ` "testRelations"."relation_name" AS "testRelations_relation_name",` +
    ` "testRelations"."test_entity_id" AS "testRelations_test_entity_id",` +
    ` "testRelations"."test_entity_id" AS "__nestjsQueryEntityId_testEntityPk__"` +
    ` FROM "test_relation" "testRelations"`;

  const oneToManyEntityClause = `"testRelations"."test_entity_id" = ?`;

  const baseOneToManySubQuery = `"testRelations"."testRelationPk" IN (SELECT "testRelations"."testRelationPk" AS "testRelations_testRelationPk" FROM "test_relation" "testRelations" WHERE ${oneToManyEntityClause})`;

  const baseManyToManyOwnerFrom =
    ` FROM "test_relation" "manyTestRelations"` +
    ` INNER JOIN "test_entity_many_test_relations_test_relation" "test_entity_many_test_relations_test_relation" ON "test_entity_many_test_relations_test_relation"."testRelationTestRelationPk" = "manyTestRelations"."testRelationPk"`;

  const baseManyToManyOwnerSelect = `${
    'SELECT ' +
    `"manyTestRelations"."testRelationPk" AS "manyTestRelations_testRelationPk",` +
    ' "manyTestRelations"."relation_name" AS "manyTestRelations_relation_name",' +
    ' "manyTestRelations"."test_entity_id" AS "manyTestRelations_test_entity_id",' +
    ' "test_entity_many_test_relations_test_relation"."testEntityTestEntityPk" AS "__nestjsQueryEntityId_testEntityPk__"'
  }${baseManyToManyOwnerFrom}`;

  const manyToManyOwnerEntityClause = '"test_entity_many_test_relations_test_relation"."testEntityTestEntityPk" = ?';

  const manyToManyOwnerSubQuery = `"manyTestRelations"."testRelationPk" IN (SELECT "manyTestRelations"."testRelationPk" AS "manyTestRelations_testRelationPk"${baseManyToManyOwnerFrom} WHERE ${manyToManyOwnerEntityClause})`;

  const baseOneToOneOwnerFrom =
    ` FROM "test_relation" "oneTestRelation"` +
    ` INNER JOIN "test_entity" "TestEntity" ON "TestEntity"."oneTestRelationTestRelationPk" = "oneTestRelation"."testRelationPk"`;

  const oneToOneOwnerEntityClause = '"TestEntity"."testEntityPk" = ?';
  const baseOneToOneOwnerSubQuery = `"oneTestRelation"."testRelationPk" IN (SELECT "oneTestRelation"."testRelationPk" AS "oneTestRelation_testRelationPk"${baseOneToOneOwnerFrom} WHERE ${oneToOneOwnerEntityClause})`;

  const oneToOneOwnerOrderBy = `ORDER BY "TestEntity"."testEntityPk" ASC`;

  const baseOneToOneOwnerSelect =
    `SELECT` +
    ` "oneTestRelation"."testRelationPk" AS "oneTestRelation_testRelationPk",` +
    ` "oneTestRelation"."relation_name" AS "oneTestRelation_relation_name",` +
    ` "oneTestRelation"."test_entity_id" AS "oneTestRelation_test_entity_id",` +
    ` "TestEntity"."testEntityPk" AS "__nestjsQueryEntityId_testEntityPk__"` +
    `${baseOneToOneOwnerFrom}`;

  const baseOneToOneNonOwnerFrom = ` FROM "test_entity" "oneTestEntity"`;
  const oneToOneNonOwnerEntityClause = '"oneTestEntity"."oneTestRelationTestRelationPk" = ?';
  const baseOneToOneNonOwnerSubQuery = `"oneTestEntity"."testEntityPk" IN (SELECT "oneTestEntity"."testEntityPk" AS "oneTestEntity_testEntityPk"${baseOneToOneNonOwnerFrom} WHERE ${oneToOneNonOwnerEntityClause})`;

  const manyToOneNonOwnerOrderBy = `ORDER BY "oneTestEntity"."oneTestRelationTestRelationPk" ASC`;

  const baseOneToOneNonOwnerSelect = `${
    `SELECT` +
    ` "oneTestEntity"."testEntityPk" AS "oneTestEntity_testEntityPk",` +
    ` "oneTestEntity"."string_type" AS "oneTestEntity_string_type",` +
    ` "oneTestEntity"."bool_type" AS "oneTestEntity_bool_type",` +
    ` "oneTestEntity"."number_type" AS "oneTestEntity_number_type",` +
    ` "oneTestEntity"."date_type" AS "oneTestEntity_date_type",` +
    ` "oneTestEntity"."oneTestRelationTestRelationPk" AS "oneTestEntity_oneTestRelationTestRelationPk",` +
    ` "oneTestEntity"."oneTestRelationTestRelationPk" AS "__nestjsQueryEntityId_testRelationPk__"`
  }${baseOneToOneNonOwnerFrom}`;

  const baseManyToManyCustomJoinFrom = ` FROM "test_entity_relation_entity" "testEntityRelation"`;

  const baseManyToManyCustomJoinEntityClause = `"testEntityRelation"."test_entity_id" = ?`;

  const baseManyToManyCustomJoinSubQuery = `("testEntityRelation"."test_relation_id", "testEntityRelation"."test_entity_id") IN (SELECT "testEntityRelation"."test_relation_id" AS "testEntityRelation_test_relation_id", "testEntityRelation"."test_entity_id" AS "testEntityRelation_test_entity_id"${baseManyToManyCustomJoinFrom} WHERE ${baseManyToManyCustomJoinEntityClause})`;

  const manyToManyCustomJoinOrderBy = `ORDER BY "testEntityRelation"."test_entity_id" ASC`;

  const baseManyToManyCustomJoinSelect = `${
    `SELECT ` +
    `"testEntityRelation"."test_relation_id" AS "testEntityRelation_test_relation_id",` +
    ` "testEntityRelation"."test_entity_id" AS "testEntityRelation_test_entity_id",` +
    ` "testEntityRelation"."test_entity_id" AS "__nestjsQueryEntityId_testEntityPk__"`
  }${baseManyToManyCustomJoinFrom}`;

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
    entity: Entity | Entity[],
    relation: string,
    query: Query<Relation>,
    expectedSql: string,
    expectedArgs: any[],
  ): void => {
    const selectQueryBuilder = getRelationQueryBuilder<Entity, Relation>(EntityClass, relation).select(entity, query);
    assertSQL(selectQueryBuilder, `${baseSQL}${expectedSql}`, expectedArgs);
  };

  const assertOneToManySQL = createSQLAsserter(TestEntity, baseOneToManySelect);

  const assertManyToManyOwnerSQL = createSQLAsserter(TestEntity, baseManyToManyOwnerSelect);

  const assertManyToOneSQL = createSQLAsserter(TestRelation, baseManyToOneSelect);

  const assertManyToManyNonOwnerSQL = createSQLAsserter(TestRelation, baseManyToManyNonOwnerSelectQuery);

  const assertOneToOneOwnerSQL = createSQLAsserter(TestEntity, baseOneToOneOwnerSelect);

  const assertOneToOneNonOwnerSQL = createSQLAsserter(TestRelation, baseOneToOneNonOwnerSelect);

  const assertManyToManyCustomJoinSQL = createSQLAsserter(TestEntity, baseManyToManyCustomJoinSelect);

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
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {},
          ` WHERE ((${oneToManyEntityClause})) AND ((${baseOneToManySubQuery})) ORDER BY "testRelations"."test_entity_id" ASC`,
          [testEntity.testEntityPk, testEntity.testEntityPk],
        );
      });

      it('should work with multiple entities', () => {
        assertOneToManySQL(
          [testEntity, { ...testEntity, testEntityPk: 'id-2' }, { ...testEntity, testEntityPk: 'id-3' }],
          'testRelations',
          {},
          ` WHERE ((${oneToManyEntityClause}) OR (${oneToManyEntityClause}) OR (${oneToManyEntityClause})) AND ((${baseOneToManySubQuery}) OR (${baseOneToManySubQuery}) OR (${baseOneToManySubQuery})) ORDER BY "testRelations"."test_entity_id" ASC`,
          [testEntity.testEntityPk, 'id-2', 'id-3', testEntity.testEntityPk, 'id-2', 'id-3'],
        );
      });
    });

    describe('many to one', () => {
      it('should work with one entity', () => {
        assertManyToOneSQL(
          testRelation,
          'testEntity',
          {},
          ` WHERE ((${manyToOneEntityClause})) AND ((${baseManyToOneFromSubQuery})) ${manyToOneOrderBy}`,
          [testRelation.testRelationPk, testRelation.testRelationPk],
        );
      });

      it('should work with multiple entities', () => {
        assertManyToOneSQL(
          [testRelation, { ...testRelation, testRelationPk: 'id-2' }, { ...testRelation, testRelationPk: 'id-3' }],
          'testEntity',
          {},
          ` WHERE ((${manyToOneEntityClause}) OR (${manyToOneEntityClause}) OR (${manyToOneEntityClause})) AND ((${baseManyToOneFromSubQuery}) OR (${baseManyToOneFromSubQuery}) OR (${baseManyToOneFromSubQuery})) ${manyToOneOrderBy}`,
          [testRelation.testRelationPk, 'id-2', 'id-3', testRelation.testRelationPk, 'id-2', 'id-3'],
        );
      });
    });

    describe('many to many', () => {
      describe('on owning side', () => {
        it('should work with one entity', () => {
          assertManyToManyOwnerSQL(
            testEntity,
            'manyTestRelations',
            {},
            ` WHERE ((${manyToManyOwnerEntityClause})) AND ((${manyToManyOwnerSubQuery})) ORDER BY "test_entity_many_test_relations_test_relation"."testEntityTestEntityPk" ASC`,
            [testEntity.testEntityPk, testEntity.testEntityPk],
          );
        });

        it('should work with mutliple entities', () => {
          assertManyToManyOwnerSQL(
            [testEntity, { ...testEntity, testEntityPk: 'id-2' }, { ...testEntity, testEntityPk: 'id-3' }],
            'manyTestRelations',
            {},
            ` WHERE ((${manyToManyOwnerEntityClause}) OR (${manyToManyOwnerEntityClause}) OR (${manyToManyOwnerEntityClause})) AND ((${manyToManyOwnerSubQuery}) OR (${manyToManyOwnerSubQuery}) OR (${manyToManyOwnerSubQuery})) ORDER BY "test_entity_many_test_relations_test_relation"."testEntityTestEntityPk" ASC`,
            [testEntity.testEntityPk, 'id-2', 'id-3', testEntity.testEntityPk, 'id-2', 'id-3'],
          );
        });
      });

      describe('on non owning side', () => {
        it('should work with many to many', () => {
          assertManyToManyNonOwnerSQL(
            testRelation,
            'manyTestEntities',
            {},
            ` WHERE ((${manyToManyNonOwnerEntityClause})) AND ((${manyToManyNonOwnerInSubQuery})) ${manyToManyOrderBy}`,
            [testRelation.testRelationPk, testRelation.testRelationPk],
          );
        });

        it('should work with many to many with multiple entities', () => {
          assertManyToManyNonOwnerSQL(
            [testRelation, { ...testRelation, testRelationPk: 'id-2' }, { ...testRelation, testRelationPk: 'id-3' }],
            'manyTestEntities',
            {},
            ` WHERE ((${manyToManyNonOwnerEntityClause}) OR (${manyToManyNonOwnerEntityClause}) OR (${manyToManyNonOwnerEntityClause})) AND ((${manyToManyNonOwnerInSubQuery}) OR (${manyToManyNonOwnerInSubQuery}) OR (${manyToManyNonOwnerInSubQuery})) ${manyToManyOrderBy}`,
            [testRelation.testRelationPk, 'id-2', 'id-3', testRelation.testRelationPk, 'id-2', 'id-3'],
          );
        });
      });

      describe('many-to-many custom join table', () => {
        it('should work with a many-to-many through a join table', () => {
          assertManyToManyCustomJoinSQL(
            testEntity,
            'testEntityRelation',
            {},
            ` WHERE ((${baseManyToManyCustomJoinEntityClause})) AND ((${baseManyToManyCustomJoinSubQuery})) ${manyToManyCustomJoinOrderBy}`,
            [testEntity.testEntityPk, testEntity.testEntityPk],
          );
        });
      });
    });

    describe('one to one', () => {
      describe('on owning side', () => {
        it('should work with one entity', () => {
          assertOneToOneOwnerSQL(
            testEntity,
            'oneTestRelation',
            {},
            ` WHERE ((${oneToOneOwnerEntityClause})) AND ((${baseOneToOneOwnerSubQuery})) ${oneToOneOwnerOrderBy}`,
            [testEntity.testEntityPk, testEntity.testEntityPk],
          );
        });

        it('should work with mutliple entities', () => {
          assertOneToOneOwnerSQL(
            [testEntity, { ...testEntity, testEntityPk: 'id-2' }, { ...testEntity, testEntityPk: 'id-3' }],
            'oneTestRelation',
            {},
            ` WHERE ((${oneToOneOwnerEntityClause}) OR (${oneToOneOwnerEntityClause}) OR (${oneToOneOwnerEntityClause})) AND ((${baseOneToOneOwnerSubQuery}) OR (${baseOneToOneOwnerSubQuery}) OR (${baseOneToOneOwnerSubQuery})) ${oneToOneOwnerOrderBy}`,
            [testEntity.testEntityPk, 'id-2', 'id-3', testEntity.testEntityPk, 'id-2', 'id-3'],
          );
        });
      });

      describe('on non owning side', () => {
        it('should work with many to many', () => {
          assertOneToOneNonOwnerSQL(
            testRelation,
            'oneTestEntity',
            {},
            ` WHERE ((${oneToOneNonOwnerEntityClause})) AND ((${baseOneToOneNonOwnerSubQuery})) ${manyToOneNonOwnerOrderBy}`,
            [testRelation.testRelationPk, testRelation.testRelationPk],
          );
        });

        it('should work with many to many with multiple entities', () => {
          assertOneToOneNonOwnerSQL(
            [testRelation, { ...testRelation, testRelationPk: 'id-2' }, { ...testRelation, testRelationPk: 'id-3' }],
            'oneTestEntity',
            {},
            ` WHERE ((${oneToOneNonOwnerEntityClause}) OR (${oneToOneNonOwnerEntityClause}) OR (${oneToOneNonOwnerEntityClause})) AND ((${baseOneToOneNonOwnerSubQuery}) OR (${baseOneToOneNonOwnerSubQuery}) OR (${baseOneToOneNonOwnerSubQuery})) ${manyToOneNonOwnerOrderBy}`,
            [testRelation.testRelationPk, 'id-2', 'id-3', testRelation.testRelationPk, 'id-2', 'id-3'],
          );
        });
      });
    });

    describe('with filter', () => {
      it('should call whereBuilder#build if there is a filter', () => {
        const query: Query<TestRelation> = { filter: { relationName: { eq: 'foo' } } };
        assertOneToManySQL(
          testEntity,
          'testRelations',
          query,
          ` WHERE ((${oneToManyEntityClause})) AND (("testRelations"."testRelationPk" IN (SELECT "testRelations"."testRelationPk" AS "testRelations_testRelationPk" FROM "test_relation" "testRelations" WHERE ${oneToManyEntityClause} AND ("testRelations"."relation_name" = ?)))) ${orderByTestRelationsTestEntityId}`,
          [testEntity.testEntityPk, testEntity.testEntityPk, 'foo'],
        );
      });
    });

    describe('with paging', () => {
      const pagingBaseFragment = ` WHERE ((${oneToManyEntityClause})) AND (("testRelations"."testRelationPk" IN (SELECT "testRelations"."testRelationPk" AS "testRelations_testRelationPk" FROM "test_relation" "testRelations" WHERE ${oneToManyEntityClause}`;

      it('should apply empty paging args', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {},
          `${pagingBaseFragment}))) ${orderByTestRelationsTestEntityId}`,
          [testEntity.testEntityPk, testEntity.testEntityPk],
        );
      });

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
          `${pagingBaseFragment} LIMIT 10 OFFSET 11))) ${orderByTestRelationsTestEntityId}`,
          [testEntity.testEntityPk, testEntity.testEntityPk],
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
          `${pagingBaseFragment} LIMIT 10 OFFSET 10))) ${orderByTestRelationsTestEntityId}`,
          [testEntity.testEntityPk, testEntity.testEntityPk],
        );
      });
    });

    describe('with sorting', () => {
      const sortingBaseFragment = ` WHERE ((${oneToManyEntityClause})) AND ((${baseOneToManySubQuery})) ${orderByTestRelationsTestEntityId}`;
      it('should apply ASC sorting', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            sorting: [{ field: 'relationName', direction: SortDirection.ASC }],
          },
          `${sortingBaseFragment}, "testRelations"."relation_name" ASC`,
          [testEntity.testEntityPk, testEntity.testEntityPk],
        );
      });

      it('should apply ASC NULLS_FIRST sorting', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            sorting: [{ field: 'relationName', direction: SortDirection.ASC, nulls: SortNulls.NULLS_FIRST }],
          },
          `${sortingBaseFragment}, "testRelations"."relation_name" ASC NULLS FIRST`,
          [testEntity.testEntityPk, testEntity.testEntityPk],
        );
      });

      it('should apply ASC NULLS_LAST sorting', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            sorting: [{ field: 'relationName', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
          },
          `${sortingBaseFragment}, "testRelations"."relation_name" ASC NULLS LAST`,
          [testEntity.testEntityPk, testEntity.testEntityPk],
        );
      });

      it('should apply DESC sorting', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            sorting: [{ field: 'relationName', direction: SortDirection.DESC }],
          },
          `${sortingBaseFragment}, "testRelations"."relation_name" DESC`,
          [testEntity.testEntityPk, testEntity.testEntityPk],
        );
      });

      it('should apply DESC NULLS_FIRST sorting', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            sorting: [{ field: 'relationName', direction: SortDirection.DESC, nulls: SortNulls.NULLS_FIRST }],
          },
          `${sortingBaseFragment}, "testRelations"."relation_name" DESC NULLS FIRST`,
          [testEntity.testEntityPk, testEntity.testEntityPk],
        );
      });

      it('should apply DESC NULLS_LAST sorting', () => {
        assertOneToManySQL(
          testEntity,
          'testRelations',
          {
            sorting: [{ field: 'relationName', direction: SortDirection.DESC, nulls: SortNulls.NULLS_LAST }],
          },
          `${sortingBaseFragment}, "testRelations"."relation_name" DESC NULLS LAST`,
          [testEntity.testEntityPk, testEntity.testEntityPk],
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
          `${sortingBaseFragment}, "testRelations"."relation_name" ASC, "testRelations"."testRelationPk" DESC`,
          [testEntity.testEntityPk, testEntity.testEntityPk],
        );
      });
    });
  });

  describe('isEntityIdCol', () => {
    it('should return true if the name is an entityId column name', () => {
      expect(RelationQueryBuilder.isEntityIdCol('__nestjsQueryEntityId_fooId__')).toBe(true);
      expect(RelationQueryBuilder.isEntityIdCol('__nestjsQueryEntityId_foo_id__')).toBe(true);
      expect(RelationQueryBuilder.isEntityIdCol('__nestjsQueryEntityId_foo.id__')).toBe(true);
    });

    it('should return false if the name is not an entityId column name', () => {
      expect(RelationQueryBuilder.isEntityIdCol('nestjsQueryEntityId_fooId__')).toBe(false);
      expect(RelationQueryBuilder.isEntityIdCol('__nestjsQueryEntityId__')).toBe(false);
      expect(RelationQueryBuilder.isEntityIdCol('__nestjsQueryEntityId_foo.id')).toBe(false);
    });
  });

  describe('parseEntityIdFromName', () => {
    it('should return the column name', () => {
      expect(RelationQueryBuilder.parseEntityIdFromName('__nestjsQueryEntityId_fooId__')).toBe('fooId');
      expect(RelationQueryBuilder.parseEntityIdFromName('__nestjsQueryEntityId_foo_id__')).toBe('foo_id');
      expect(RelationQueryBuilder.parseEntityIdFromName('__nestjsQueryEntityId_foo.id__')).toBe('foo.id');
    });
  });

  describe('getRelationPrimaryKeysPropertyNameAndColumnsName', () => {
    it('should return the primary key propertyName and selected column name on owning side', () => {
      const oneToManyPks = getRelationQueryBuilder(
        TestEntity,
        'testRelations',
      ).getRelationPrimaryKeysPropertyNameAndColumnsName();
      expect(oneToManyPks).toEqual([
        {
          columnName: 'testRelations_testRelationPk',
          propertyName: 'testRelationPk',
        },
      ]);

      const manyToManyOwnerPks = getRelationQueryBuilder(
        TestEntity,
        'manyTestRelations',
      ).getRelationPrimaryKeysPropertyNameAndColumnsName();
      expect(manyToManyOwnerPks).toEqual([
        {
          columnName: 'manyTestRelations_testRelationPk',
          propertyName: 'testRelationPk',
        },
      ]);

      const oneToOneOwnerPks = getRelationQueryBuilder(
        TestEntity,
        'oneTestRelation',
      ).getRelationPrimaryKeysPropertyNameAndColumnsName();
      expect(oneToOneOwnerPks).toEqual([
        {
          columnName: 'oneTestRelation_testRelationPk',
          propertyName: 'testRelationPk',
        },
      ]);
    });

    it('should return the primary key propertyName and selected column name on none owning side', () => {
      const oneToManyPks = getRelationQueryBuilder(
        TestRelation,
        'testEntity',
      ).getRelationPrimaryKeysPropertyNameAndColumnsName();
      expect(oneToManyPks).toEqual([
        {
          columnName: 'testEntity_testEntityPk',
          propertyName: 'testEntityPk',
        },
      ]);

      const manyToManyOwnerPks = getRelationQueryBuilder(
        TestRelation,
        'manyTestEntities',
      ).getRelationPrimaryKeysPropertyNameAndColumnsName();
      expect(manyToManyOwnerPks).toEqual([
        {
          columnName: 'manyTestEntities_testEntityPk',
          propertyName: 'testEntityPk',
        },
      ]);

      const oneToOneOwnerPks = getRelationQueryBuilder(
        TestRelation,
        'oneTestEntity',
      ).getRelationPrimaryKeysPropertyNameAndColumnsName();
      expect(oneToOneOwnerPks).toEqual([
        {
          columnName: 'oneTestEntity_testEntityPk',
          propertyName: 'testEntityPk',
        },
      ]);
    });
  });
});
