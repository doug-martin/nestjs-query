import { Filter, SortDirection } from '@nestjs-query/core';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmQueryService } from '../../src';
import { FilterQueryBuilder } from '../../src/query';
import {
  closeTestConnection,
  CONNECTION_OPTIONS,
  getTestConnection,
  refresh,
  truncate,
} from '../__fixtures__/connection.fixture';
import { TEST_ENTITIES, TEST_RELATIONS, TEST_SOFT_DELETE_ENTITIES } from '../__fixtures__/seeds';
import { TestEntityRelationEntity } from '../__fixtures__/test-entity-relation.entity';
import { TestRelation } from '../__fixtures__/test-relation.entity';
import { TestSoftDeleteEntity } from '../__fixtures__/test-soft-delete.entity';
import { TestEntity } from '../__fixtures__/test.entity';

describe('TypeOrmQueryService', (): void => {
  let moduleRef: TestingModule;

  class TestEntityService extends TypeOrmQueryService<TestEntity> {
    constructor(@InjectRepository(TestEntity) readonly repo: Repository<TestEntity>) {
      super(repo);
    }
  }

  class TestRelationService extends TypeOrmQueryService<TestRelation> {
    constructor(@InjectRepository(TestRelation) readonly repo: Repository<TestRelation>) {
      super(repo);
    }
  }

  class TestSoftDeleteEntityService extends TypeOrmQueryService<TestSoftDeleteEntity> {
    constructor(@InjectRepository(TestSoftDeleteEntity) readonly repo: Repository<TestSoftDeleteEntity>) {
      super(repo, { useSoftDelete: true });
    }
  }

  afterEach(closeTestConnection);

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(CONNECTION_OPTIONS),
        TypeOrmModule.forFeature([TestEntity, TestRelation, TestEntityRelationEntity, TestSoftDeleteEntity]),
      ],
      providers: [TestEntityService, TestRelationService, TestSoftDeleteEntityService],
    }).compile();
    await refresh();
  });

  it('should create a filterQueryBuilder and assemblerService based on the repo passed in if not provided', () => {
    const queryService = moduleRef.get(TestEntityService);
    expect(queryService.filterQueryBuilder).toBeInstanceOf(FilterQueryBuilder);
    expect(queryService.filterQueryBuilder.repo.target).toBe(TestEntity);
  });

  describe('#query', () => {
    it('call select and return the result', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { eq: 'foo1' } } });
      return expect(queryResult).toEqual([TEST_ENTITIES[0]]);
    });

    describe('filter on relations', () => {
      describe('deeply nested', () => {
        it('oneToOne - oneToMany', async () => {
          const entity = TEST_ENTITIES[0];
          const relationEntity = TEST_RELATIONS.find((r) => r.testEntityId === entity.testEntityPk);
          expect(relationEntity).toBeDefined();
          const queryService = moduleRef.get(TestEntityService);
          const queryResult = await queryService.query({
            filter: {
              oneTestRelation: {
                relationsOfTestRelation: {
                  testRelationId: {
                    eq: relationEntity?.testRelationPk,
                  },
                },
              },
            },
          });
          expect(queryResult).toEqual([entity]);
        });
        it('oneToOne - manyToOne', async () => {
          const entity = TEST_ENTITIES[0];
          const relationEntity = TEST_RELATIONS.find((r) => r.testEntityId === entity.testEntityPk);
          expect(relationEntity).toBeDefined();
          const queryService = moduleRef.get(TestEntityService);
          const queryResult = await queryService.query({
            filter: {
              oneTestRelation: {
                relationOfTestRelation: {
                  testRelationId: {
                    eq: relationEntity?.testRelationPk,
                  },
                },
              },
            },
          });
          expect(queryResult).toEqual([entity]);
        });
      });
      describe('oneToOne', () => {
        it('should allow filtering on a one to one relation', async () => {
          const entity = TEST_ENTITIES[0];
          const queryService = moduleRef.get(TestEntityService);
          const queryResult = await queryService.query({
            filter: {
              oneTestRelation: {
                testRelationPk: {
                  in: [`test-relations-${entity.testEntityPk}-1`, `test-relations-${entity.testEntityPk}-3`],
                },
              },
            },
          });
          expect(queryResult).toEqual([entity]);
        });

        it('should allow filtering on a one to one relation with an OR clause', async () => {
          const entity = TEST_ENTITIES[0];
          const queryService = moduleRef.get(TestEntityService);
          const queryResult = await queryService.query({
            filter: {
              or: [
                { testEntityPk: { eq: TEST_ENTITIES[1].testEntityPk } },
                {
                  oneTestRelation: {
                    testRelationPk: {
                      in: [`test-relations-${entity.testEntityPk}-1`, `test-relations-${entity.testEntityPk}-3`],
                    },
                  },
                },
              ],
            },
            sorting: [{ field: 'testEntityPk', direction: SortDirection.ASC }],
            paging: { limit: 2 },
          });
          expect(queryResult).toEqual([entity, TEST_ENTITIES[1]]);
        });
      });

      describe('manyToOne', () => {
        it('should allow filtering on a many to one relation', async () => {
          const queryService = moduleRef.get(TestRelationService);
          const queryResults = await queryService.query({
            filter: {
              testEntity: {
                testEntityPk: {
                  in: [TEST_ENTITIES[0].testEntityPk, TEST_ENTITIES[1].testEntityPk],
                },
              },
            },
          });
          expect(queryResults).toBeArrayOfSize(6);
          queryResults.map((e, idx) => {
            expect(e).toMatchObject(TEST_RELATIONS[idx]);
          });
        });

        it('should allow filtering on a uni directional many to one relation', async () => {
          const queryService = moduleRef.get(TestRelationService);
          const queryResults = await queryService.query({
            filter: {
              testEntityUniDirectional: {
                testEntityPk: {
                  in: [TEST_ENTITIES[0].testEntityPk, TEST_ENTITIES[1].testEntityPk],
                },
              },
            },
          });
          expect(queryResults).toBeArrayOfSize(6);
          queryResults.map((e, idx) => {
            expect(e).toMatchObject(TEST_RELATIONS[idx]);
          });
        });

        it('should allow filtering on a many to one relation with paging', async () => {
          const queryService = moduleRef.get(TestRelationService);
          const queryResults = await queryService.query({
            filter: {
              or: [
                { testRelationPk: { eq: TEST_RELATIONS[6].testRelationPk } },
                {
                  testEntity: {
                    testEntityPk: {
                      in: [TEST_ENTITIES[0].testEntityPk, TEST_ENTITIES[1].testEntityPk],
                    },
                  },
                },
              ],
            },
            sorting: [{ field: 'testRelationPk', direction: SortDirection.ASC }],
            paging: { limit: 3 },
          });
          expect(queryResults).toBeArrayOfSize(3);
          queryResults.map((e, idx) => {
            expect(e).toMatchObject(TEST_RELATIONS[idx]);
          });
        });
      });

      describe('oneToMany', () => {
        it('should allow filtering on a many to one relation', async () => {
          const entity = TEST_ENTITIES[0];
          const queryService = moduleRef.get(TestEntityService);
          const queryResult = await queryService.query({
            filter: {
              testRelations: {
                relationName: {
                  in: [TEST_RELATIONS[0].relationName, TEST_RELATIONS[1].relationName],
                },
              },
            },
          });
          expect(queryResult).toEqual([entity]);
        });
        it('should allow filtering on a one to many relation with paging', async () => {
          const entity = TEST_ENTITIES[0];
          const queryService = moduleRef.get(TestEntityService);
          const queryResult = await queryService.query({
            filter: {
              or: [
                { testEntityPk: { eq: TEST_ENTITIES[1].testEntityPk } },
                {
                  testRelations: {
                    testRelationPk: {
                      in: [`test-relations-${entity.testEntityPk}-1`, `test-relations-${entity.testEntityPk}-3`],
                    },
                  },
                },
              ],
            },
            sorting: [{ field: 'testEntityPk', direction: SortDirection.ASC }],
            paging: { limit: 2 },
          });
          expect(queryResult).toEqual([entity, TEST_ENTITIES[1]]);
        });
      });

      describe('manyToMany', () => {
        it('should allow filtering on a many to many relation', async () => {
          const queryService = moduleRef.get(TestEntityService);
          const queryResult = await queryService.query({
            filter: {
              manyTestRelations: {
                relationName: {
                  in: [TEST_RELATIONS[1].relationName, TEST_RELATIONS[4].relationName],
                },
              },
            },
          });
          expect(queryResult).toEqual([
            TEST_ENTITIES[1],
            TEST_ENTITIES[3],
            TEST_ENTITIES[5],
            TEST_ENTITIES[7],
            TEST_ENTITIES[9],
          ]);
        });

        it('should allow filtering on a many to many uni-directional relation', async () => {
          const queryService = moduleRef.get(TestEntityService);
          const queryResult = await queryService.query({
            filter: {
              manyToManyUniDirectional: {
                relationName: {
                  in: [TEST_RELATIONS[2].relationName, TEST_RELATIONS[5].relationName],
                },
              },
            },
          });
          expect(queryResult).toEqual([TEST_ENTITIES[2], TEST_ENTITIES[5], TEST_ENTITIES[8]]);
        });
        it('should allow filtering on a many to many relation with paging', async () => {
          const queryService = moduleRef.get(TestEntityService);
          const queryResult = await queryService.query({
            filter: {
              or: [
                { testEntityPk: { eq: TEST_ENTITIES[2].testEntityPk } },
                {
                  manyTestRelations: {
                    relationName: {
                      in: [TEST_RELATIONS[1].relationName, TEST_RELATIONS[4].relationName],
                    },
                  },
                },
              ],
            },
            sorting: [{ field: 'numberType', direction: SortDirection.ASC }],
            paging: { limit: 6 },
          });
          expect(queryResult).toEqual([
            TEST_ENTITIES[1],
            TEST_ENTITIES[2], // additional one from the or
            TEST_ENTITIES[3],
            TEST_ENTITIES[5],
            TEST_ENTITIES[7],
            TEST_ENTITIES[9],
          ]);
        });
      });
    });
  });

  describe('#aggregate', () => {
    it('call select with the aggregate columns and return the result', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.aggregate(
        {},
        {
          count: ['testEntityPk'],
          avg: ['numberType'],
          sum: ['numberType'],
          max: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
          min: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
        },
      );
      return expect(queryResult).toEqual([
        {
          avg: {
            numberType: 5.5,
          },
          count: {
            testEntityPk: 10,
          },
          max: {
            dateType: expect.stringMatching('2020-02-10'),
            numberType: 10,
            stringType: 'foo9',
            testEntityPk: 'test-entity-9',
          },
          min: {
            dateType: expect.stringMatching('2020-02-01'),
            numberType: 1,
            stringType: 'foo1',
            testEntityPk: 'test-entity-1',
          },
          sum: {
            numberType: 55,
          },
        },
      ]);
    });

    it('call aggregate with a group by', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.aggregate(
        {},
        {
          groupBy: ['boolType'],
          count: ['testEntityPk'],
          avg: ['numberType'],
          sum: ['numberType'],
          max: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
          min: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
        },
      );
      return expect(queryResult).toEqual([
        {
          groupBy: {
            boolType: 0,
          },
          avg: {
            numberType: 5,
          },
          count: {
            testEntityPk: 5,
          },
          max: {
            dateType: expect.stringMatching('2020-02-09'),
            numberType: 9,
            stringType: 'foo9',
            testEntityPk: 'test-entity-9',
          },
          min: {
            dateType: expect.stringMatching('2020-02-01'),
            numberType: 1,
            stringType: 'foo1',
            testEntityPk: 'test-entity-1',
          },
          sum: {
            numberType: 25,
          },
        },
        {
          groupBy: {
            boolType: 1,
          },
          avg: {
            numberType: 6,
          },
          count: {
            testEntityPk: 5,
          },
          max: {
            dateType: expect.stringMatching('2020-02-10'),
            numberType: 10,
            stringType: 'foo8',
            testEntityPk: 'test-entity-8',
          },
          min: {
            dateType: expect.stringMatching('2020-02-02'),
            numberType: 2,
            stringType: 'foo10',
            testEntityPk: 'test-entity-10',
          },
          sum: {
            numberType: 30,
          },
        },
      ]);
    });

    it('call select with the aggregate columns and return the result with a filter', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.aggregate(
        { stringType: { in: ['foo1', 'foo2', 'foo3'] } },
        {
          count: ['testEntityPk'],
          avg: ['numberType'],
          sum: ['numberType'],
          max: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
          min: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
        },
      );
      return expect(queryResult).toEqual([
        {
          avg: {
            numberType: 2,
          },
          count: {
            testEntityPk: 3,
          },
          max: {
            dateType: expect.stringMatching('2020-02-03'),
            numberType: 3,
            stringType: 'foo3',
            testEntityPk: 'test-entity-3',
          },
          min: {
            dateType: expect.stringMatching('2020-02-01'),
            numberType: 1,
            stringType: 'foo1',
            testEntityPk: 'test-entity-1',
          },
          sum: {
            numberType: 6,
          },
        },
      ]);
    });

    it('call aggregate with a group and filter', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.aggregate(
        { stringType: { in: ['foo1', 'foo2', 'foo3'] } },
        {
          groupBy: ['boolType'],
          count: ['testEntityPk'],
          avg: ['numberType'],
          sum: ['numberType'],
          max: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
          min: ['testEntityPk', 'dateType', 'numberType', 'stringType'],
        },
      );
      return expect(queryResult).toEqual([
        {
          groupBy: {
            boolType: 0,
          },
          avg: {
            numberType: 2,
          },
          count: {
            testEntityPk: 2,
          },
          max: {
            dateType: expect.stringMatching('2020-02-03'),
            numberType: 3,
            stringType: 'foo3',
            testEntityPk: 'test-entity-3',
          },
          min: {
            dateType: expect.stringMatching('2020-02-01'),
            numberType: 1,
            stringType: 'foo1',
            testEntityPk: 'test-entity-1',
          },
          sum: {
            numberType: 4,
          },
        },
        {
          groupBy: {
            boolType: 1,
          },
          avg: {
            numberType: 2,
          },
          count: {
            testEntityPk: 1,
          },
          max: {
            dateType: expect.stringMatching('2020-02-02'),
            numberType: 2,
            stringType: 'foo2',
            testEntityPk: 'test-entity-2',
          },
          min: {
            dateType: expect.stringMatching('2020-02-02'),
            numberType: 2,
            stringType: 'foo2',
            testEntityPk: 'test-entity-2',
          },
          sum: {
            numberType: 2,
          },
        },
      ]);
    });
  });

  describe('#count', () => {
    it('call select and return the result', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.count({ stringType: { like: 'foo%' } });
      return expect(queryResult).toBe(10);
    });

    describe('with relations', () => {
      describe('oneToOne', () => {
        it('should properly count the number pf records with the associated relations', async () => {
          const entity = TEST_ENTITIES[0];
          const queryService = moduleRef.get(TestEntityService);
          const count = await queryService.count({
            oneTestRelation: {
              testRelationPk: {
                in: [`test-relations-${entity.testEntityPk}-1`, `test-relations-${entity.testEntityPk}-3`],
              },
            },
          });
          expect(count).toBe(1);
        });
      });

      describe('manyToOne', () => {
        it('set the relation to null', async () => {
          const queryService = moduleRef.get(TestRelationService);
          const count = await queryService.count({
            testEntity: {
              testEntityPk: {
                in: [TEST_ENTITIES[0].testEntityPk, TEST_ENTITIES[2].testEntityPk],
              },
            },
          });
          expect(count).toBe(6);
        });
      });

      describe('oneToMany', () => {
        it('set the relation to null', async () => {
          const relation = TEST_RELATIONS[0];
          const queryService = moduleRef.get(TestEntityService);
          const count = await queryService.count({
            testRelations: {
              testEntityId: {
                in: [relation.testEntityId as string],
              },
            },
          });
          expect(count).toBe(1);
        });
      });
    });
  });

  describe('#queryRelations', () => {
    describe('with one entity', () => {
      it('call select and return the result', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestRelation, 'testRelations', TEST_ENTITIES[0], {});
        return expect(queryResult.map((r) => r.testEntityId)).toEqual([
          TEST_ENTITIES[0].testEntityPk,
          TEST_ENTITIES[0].testEntityPk,
          TEST_ENTITIES[0].testEntityPk,
        ]);
      });

      it('should apply a filter', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestRelation, 'testRelations', TEST_ENTITIES[0], {
          filter: { testRelationPk: { notLike: '%-1' } },
        });
        return expect(queryResult.map((r) => r.testRelationPk)).toEqual([
          TEST_RELATIONS[1].testRelationPk,
          TEST_RELATIONS[2].testRelationPk,
        ]);
      });

      it('should apply a paging', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestRelation, 'testRelations', TEST_ENTITIES[0], {
          paging: { limit: 2, offset: 1 },
        });
        return expect(queryResult.map((r) => r.testRelationPk)).toEqual([
          TEST_RELATIONS[1].testRelationPk,
          TEST_RELATIONS[2].testRelationPk,
        ]);
      });

      describe('manyToMany', () => {
        it('call select and return the with a uni-directional relation', async () => {
          const entity = TEST_ENTITIES[2];
          const queryService = moduleRef.get(TestEntityService);
          const queryResult = (
            await queryService.queryRelations(TestRelation, 'manyToManyUniDirectional', entity, {})
          ).map((r) => {
            delete r.relationOfTestRelationId;
            return r;
          });

          TEST_RELATIONS.filter((tr) => tr.relationName.endsWith('three')).forEach((tr) => {
            expect(queryResult).toContainEqual(tr);
          });
        });
      });
    });

    describe('with multiple entities', () => {
      it('call select and return the result', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestRelation, 'testRelations', entities, {});

        expect(queryResult.size).toBe(3);
        entities.forEach((e) => expect(queryResult.get(e)).toHaveLength(3));
      });

      it('should apply a filter', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestRelation, 'testRelations', entities, {
          filter: { testRelationPk: { notLike: '%-1' } },
        });

        expect(queryResult.size).toBe(3);
        entities.forEach((e) => expect(queryResult.get(e)).toHaveLength(2));
      });

      it('should apply paging', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestRelation, 'testRelations', entities, {
          paging: { limit: 2, offset: 1 },
        });

        expect(queryResult.size).toBe(3);
        entities.forEach((e) => expect(queryResult.get(e)).toHaveLength(2));
      });

      it('should return an empty array if no results are found.', async () => {
        const entities: TestEntity[] = [TEST_ENTITIES[0], { testEntityPk: 'does-not-exist' } as TestEntity];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestRelation, 'testRelations', entities, {
          filter: { relationName: { isNot: null } },
        });

        expect(queryResult.size).toBe(1);
        expect(queryResult.get(entities[0])).toHaveLength(3);
        expect(queryResult.get(entities[1])).toBeUndefined();
      });
    });
  });

  describe('#aggregateRelations', () => {
    describe('with one entity', () => {
      it('call select and return the result', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const aggResult = await queryService.aggregateRelations(
          TestRelation,
          'testRelations',
          TEST_ENTITIES[0],
          {},
          { count: ['testRelationPk'] },
        );
        return expect(aggResult).toEqual([
          {
            count: {
              testRelationPk: 3,
            },
          },
        ]);
      });

      it('should apply a filter', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const aggResult = await queryService.aggregateRelations(
          TestRelation,
          'testRelations',
          TEST_ENTITIES[0],
          { testRelationPk: { notLike: '%-1' } },
          { count: ['testRelationPk'] },
        );
        return expect(aggResult).toEqual([
          {
            count: {
              testRelationPk: 2,
            },
          },
        ]);
      });
    });

    describe('with multiple entities', () => {
      it('aggregate for each entities relation', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.aggregateRelations(
          TestRelation,
          'testRelations',
          entities,
          {},
          {
            count: ['testRelationPk', 'relationName', 'testEntityId'],
            min: ['testRelationPk', 'relationName', 'testEntityId'],
            max: ['testRelationPk', 'relationName', 'testEntityId'],
          },
        );

        expect(queryResult.size).toBe(3);
        expect(queryResult).toEqual(
          new Map([
            [
              entities[0],
              [
                {
                  count: {
                    relationName: 3,
                    testEntityId: 3,
                    testRelationPk: 3,
                  },
                  max: {
                    relationName: 'foo1-test-relation-two',
                    testEntityId: 'test-entity-1',
                    testRelationPk: 'test-relations-test-entity-1-3',
                  },
                  min: {
                    relationName: 'foo1-test-relation-one',
                    testEntityId: 'test-entity-1',
                    testRelationPk: 'test-relations-test-entity-1-1',
                  },
                },
              ],
            ],
            [
              entities[1],
              [
                {
                  count: {
                    relationName: 3,
                    testEntityId: 3,
                    testRelationPk: 3,
                  },
                  max: {
                    relationName: 'foo2-test-relation-two',
                    testEntityId: 'test-entity-2',
                    testRelationPk: 'test-relations-test-entity-2-3',
                  },
                  min: {
                    relationName: 'foo2-test-relation-one',
                    testEntityId: 'test-entity-2',
                    testRelationPk: 'test-relations-test-entity-2-1',
                  },
                },
              ],
            ],
            [
              entities[2],
              [
                {
                  count: {
                    relationName: 3,
                    testEntityId: 3,
                    testRelationPk: 3,
                  },
                  max: {
                    relationName: 'foo3-test-relation-two',
                    testEntityId: 'test-entity-3',
                    testRelationPk: 'test-relations-test-entity-3-3',
                  },
                  min: {
                    relationName: 'foo3-test-relation-one',
                    testEntityId: 'test-entity-3',
                    testRelationPk: 'test-relations-test-entity-3-1',
                  },
                },
              ],
            ],
          ]),
        );
      });

      it('aggregate and group for each entities relation', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.aggregateRelations(
          TestRelation,
          'testRelations',
          entities,
          {},
          {
            groupBy: ['testEntityId'],
            count: ['testRelationPk', 'relationName', 'testEntityId'],
            min: ['testRelationPk', 'relationName', 'testEntityId'],
            max: ['testRelationPk', 'relationName', 'testEntityId'],
          },
        );

        expect(queryResult.size).toBe(3);
        expect(queryResult).toEqual(
          new Map([
            [
              entities[0],
              [
                {
                  groupBy: {
                    testEntityId: 'test-entity-1',
                  },
                  count: {
                    relationName: 3,
                    testEntityId: 3,
                    testRelationPk: 3,
                  },
                  max: {
                    relationName: 'foo1-test-relation-two',
                    testEntityId: 'test-entity-1',
                    testRelationPk: 'test-relations-test-entity-1-3',
                  },
                  min: {
                    relationName: 'foo1-test-relation-one',
                    testEntityId: 'test-entity-1',
                    testRelationPk: 'test-relations-test-entity-1-1',
                  },
                },
              ],
            ],
            [
              entities[1],
              [
                {
                  groupBy: {
                    testEntityId: 'test-entity-2',
                  },
                  count: {
                    relationName: 3,
                    testEntityId: 3,
                    testRelationPk: 3,
                  },
                  max: {
                    relationName: 'foo2-test-relation-two',
                    testEntityId: 'test-entity-2',
                    testRelationPk: 'test-relations-test-entity-2-3',
                  },
                  min: {
                    relationName: 'foo2-test-relation-one',
                    testEntityId: 'test-entity-2',
                    testRelationPk: 'test-relations-test-entity-2-1',
                  },
                },
              ],
            ],
            [
              entities[2],
              [
                {
                  groupBy: {
                    testEntityId: 'test-entity-3',
                  },
                  count: {
                    relationName: 3,
                    testEntityId: 3,
                    testRelationPk: 3,
                  },
                  max: {
                    relationName: 'foo3-test-relation-two',
                    testEntityId: 'test-entity-3',
                    testRelationPk: 'test-relations-test-entity-3-3',
                  },
                  min: {
                    relationName: 'foo3-test-relation-one',
                    testEntityId: 'test-entity-3',
                    testRelationPk: 'test-relations-test-entity-3-1',
                  },
                },
              ],
            ],
          ]),
        );
      });

      it('should apply a filter', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.aggregateRelations(
          TestRelation,
          'testRelations',
          entities,
          { testRelationPk: { notLike: '%-1' } },
          {
            count: ['testRelationPk', 'relationName', 'testEntityId'],
            min: ['testRelationPk', 'relationName', 'testEntityId'],
            max: ['testRelationPk', 'relationName', 'testEntityId'],
          },
        );

        expect(queryResult.size).toBe(3);
        expect(queryResult).toEqual(
          new Map([
            [
              entities[0],
              [
                {
                  count: {
                    relationName: 2,
                    testEntityId: 2,
                    testRelationPk: 2,
                  },
                  max: {
                    relationName: 'foo1-test-relation-two',
                    testEntityId: 'test-entity-1',
                    testRelationPk: 'test-relations-test-entity-1-3',
                  },
                  min: {
                    relationName: 'foo1-test-relation-three',
                    testEntityId: 'test-entity-1',
                    testRelationPk: 'test-relations-test-entity-1-2',
                  },
                },
              ],
            ],
            [
              entities[1],
              [
                {
                  count: {
                    relationName: 2,
                    testEntityId: 2,
                    testRelationPk: 2,
                  },
                  max: {
                    relationName: 'foo2-test-relation-two',
                    testEntityId: 'test-entity-2',
                    testRelationPk: 'test-relations-test-entity-2-3',
                  },
                  min: {
                    relationName: 'foo2-test-relation-three',
                    testEntityId: 'test-entity-2',
                    testRelationPk: 'test-relations-test-entity-2-2',
                  },
                },
              ],
            ],
            [
              entities[2],
              [
                {
                  count: {
                    relationName: 2,
                    testEntityId: 2,
                    testRelationPk: 2,
                  },
                  max: {
                    relationName: 'foo3-test-relation-two',
                    testEntityId: 'test-entity-3',
                    testRelationPk: 'test-relations-test-entity-3-3',
                  },
                  min: {
                    relationName: 'foo3-test-relation-three',
                    testEntityId: 'test-entity-3',
                    testRelationPk: 'test-relations-test-entity-3-2',
                  },
                },
              ],
            ],
          ]),
        );
      });

      it('should return an empty array if no results are found.', async () => {
        const entities: TestEntity[] = [TEST_ENTITIES[0], { testEntityPk: 'does-not-exist' } as TestEntity];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.aggregateRelations(
          TestRelation,
          'testRelations',
          entities,
          { relationName: { isNot: null } },
          {
            count: ['testRelationPk', 'relationName', 'testEntityId'],
            min: ['testRelationPk', 'relationName', 'testEntityId'],
            max: ['testRelationPk', 'relationName', 'testEntityId'],
          },
        );

        expect(queryResult).toEqual(
          new Map([
            [
              entities[0],
              [
                {
                  count: {
                    relationName: 3,
                    testEntityId: 3,
                    testRelationPk: 3,
                  },
                  max: {
                    relationName: 'foo1-test-relation-two',
                    testEntityId: 'test-entity-1',
                    testRelationPk: 'test-relations-test-entity-1-3',
                  },
                  min: {
                    relationName: 'foo1-test-relation-one',
                    testEntityId: 'test-entity-1',
                    testRelationPk: 'test-relations-test-entity-1-1',
                  },
                },
              ],
            ],
            [
              { testEntityPk: 'does-not-exist' } as TestEntity,
              [
                {
                  count: {
                    relationName: 0,
                    testEntityId: 0,
                    testRelationPk: 0,
                  },
                  max: {
                    relationName: null,
                    testEntityId: null,
                    testRelationPk: null,
                  },
                  min: {
                    relationName: null,
                    testEntityId: null,
                    testRelationPk: null,
                  },
                },
              ],
            ],
          ]),
        );
      });
    });
  });

  describe('#countRelations', () => {
    describe('with one entity', () => {
      it('call count and return the result', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const countResult = await queryService.countRelations(TestRelation, 'testRelations', TEST_ENTITIES[0], {
          relationName: { isNot: null },
        });
        return expect(countResult).toBe(3);
      });
    });

    describe('with multiple entities', () => {
      it('call count and return the result', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.countRelations(TestRelation, 'testRelations', entities, {
          relationName: { isNot: null },
        });

        expect(queryResult).toEqual(
          new Map([
            [entities[0], 3],
            [entities[1], 3],
            [entities[2], 3],
          ]),
        );
      });
    });
  });

  describe('#findRelation', () => {
    describe('with one entity', () => {
      it('call select and return the result', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestRelation, 'oneTestRelation', entity);

        expect(queryResult).toMatchObject(TEST_RELATIONS[0]);
      });

      it('apply the filter option', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult1 = await queryService.findRelation(TestRelation, 'oneTestRelation', entity, {
          filter: { relationName: { eq: TEST_RELATIONS[0].relationName } },
        });
        expect(queryResult1).toMatchObject(TEST_RELATIONS[0]);

        const queryResult2 = await queryService.findRelation(TestRelation, 'oneTestRelation', entity, {
          filter: { relationName: { eq: TEST_RELATIONS[1].relationName } },
        });
        expect(queryResult2).toBeUndefined();
      });

      it('should return undefined select if no results are found.', async () => {
        const entity = { ...TEST_ENTITIES[0], testEntityPk: 'not-real' };
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestRelation, 'oneTestRelation', entity);

        expect(queryResult).toBeUndefined();
      });

      it('throw an error if a relation with that name is not found.', async () => {
        const queryService = moduleRef.get(TestEntityService);
        return expect(queryService.findRelation(TestRelation, 'badRelation', TEST_ENTITIES[0])).rejects.toThrow(
          'Unable to find relation badRelation on TestEntity',
        );
      });

      describe('manyToOne', () => {
        it('call select and return the with a uni-directional relation', async () => {
          const entity = TEST_RELATIONS[0];
          const queryService = moduleRef.get(TestRelationService);
          const queryResult = await queryService.findRelation(TestEntity, 'testEntityUniDirectional', entity);

          expect(queryResult).toEqual(TEST_ENTITIES[0]);
        });
      });
    });

    describe('with multiple entities', () => {
      it('call select and return the result', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestRelation, 'oneTestRelation', entities);

        const adaptedQueryResult = new Map();
        queryResult.forEach((entry, key) => {
          delete entry?.relationOfTestRelationId;
          adaptedQueryResult.set(key, entry);
        });

        expect(adaptedQueryResult).toEqual(
          new Map([
            [entities[0], TEST_RELATIONS[0]],
            [entities[1], TEST_RELATIONS[3]],
            [entities[2], TEST_RELATIONS[6]],
          ]),
        );
      });

      it('should apply the filter option', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestRelation, 'oneTestRelation', entities, {
          filter: { testRelationPk: { in: [TEST_RELATIONS[0].testRelationPk, TEST_RELATIONS[6].testRelationPk] } },
        });
        const adaptedQueryResult = new Map();
        queryResult.forEach((entry, key) => {
          delete entry?.relationOfTestRelationId;
          adaptedQueryResult.set(key, entry);
        });
        expect(adaptedQueryResult).toEqual(
          new Map([
            [entities[0], TEST_RELATIONS[0]],
            [entities[2], TEST_RELATIONS[6]],
          ]),
        );
      });

      it('should return undefined select if no results are found.', async () => {
        const entities: TestEntity[] = [TEST_ENTITIES[0], { testEntityPk: 'does-not-exist' } as TestEntity];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestRelation, 'oneTestRelation', entities);
        const adaptedQueryResult = new Map();
        queryResult.forEach((entry, key) => {
          delete entry?.relationOfTestRelationId;
          adaptedQueryResult.set(key, entry);
        });
        expect(adaptedQueryResult).toEqual(new Map([[entities[0], TEST_RELATIONS[0]]]));
      });
    });
  });

  describe('#addRelations', () => {
    it('call select and return the result', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.addRelations(
        'testRelations',
        entity.testEntityPk,
        TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk),
      );
      expect(queryResult).toEqual(entity);

      const relations = await queryService.queryRelations(TestRelation, 'testRelations', entity, {});
      expect(relations).toHaveLength(6);
    });

    it('should not modify if the relationIds is empty', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.addRelations('testRelations', entity.testEntityPk, []);
      expect(queryResult).toEqual(entity);

      const relations = await queryService.queryRelations(TestRelation, 'testRelations', entity, {});
      expect(relations).toHaveLength(3);
    });

    describe('with modify options', () => {
      it('should throw an error if the entity is not found with the id and provided filter', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.addRelations(
            'testRelations',
            entity.testEntityPk,
            TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk),
            {
              filter: { stringType: { eq: TEST_ENTITIES[1].stringType } },
            },
          ),
        ).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
      });

      it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.addRelations<TestRelation>(
            'testRelations',
            entity.testEntityPk,
            TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk),
            {
              relationFilter: { relationName: { like: '%-one' } },
            },
          ),
        ).rejects.toThrow('Unable to find all testRelations to add to TestEntity');
      });
    });
  });

  describe('#setRelations', () => {
    it('set all relations on the entity', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const relationIds = TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk);
      const queryResult = await queryService.setRelations('testRelations', entity.testEntityPk, relationIds);
      expect(queryResult).toEqual(entity);

      const relations = await queryService.queryRelations(TestRelation, 'testRelations', entity, {});
      expect(relations.map((r) => r.testRelationPk)).toEqual(relationIds);
    });

    it('should remove all relations if the relationIds is empty', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.setRelations('testRelations', entity.testEntityPk, []);
      expect(queryResult).toEqual(entity);

      const relations = await queryService.queryRelations(TestRelation, 'testRelations', entity, {});
      expect(relations.map((r) => r.testRelationPk)).toEqual([]);
    });

    describe('with modify options', () => {
      it('should throw an error if the entity is not found with the id and provided filter', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.setRelations(
            'testRelations',
            entity.testEntityPk,
            TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk),
            {
              filter: { stringType: { eq: TEST_ENTITIES[1].stringType } },
            },
          ),
        ).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
      });

      it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.setRelations<TestRelation>(
            'testRelations',
            entity.testEntityPk,
            TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk),
            {
              relationFilter: { relationName: { like: '%-one' } },
            },
          ),
        ).rejects.toThrow('Unable to find all testRelations to set on TestEntity');
      });
    });
  });

  describe('#setRelation', () => {
    it('call select and return the result', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.setRelation(
        'oneTestRelation',
        entity.testEntityPk,
        TEST_RELATIONS[1].testRelationPk,
      );
      expect(queryResult).toEqual(entity);

      const relation = await queryService.findRelation(TestRelation, 'oneTestRelation', entity);
      expect(relation?.testRelationPk).toBe(TEST_RELATIONS[1].testRelationPk);
    });

    describe('with modify options', () => {
      it('should throw an error if the entity is not found with the id and provided filter', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.setRelation('oneTestRelation', entity.testEntityPk, TEST_RELATIONS[1].testRelationPk, {
            filter: { stringType: { eq: TEST_ENTITIES[1].stringType } },
          }),
        ).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
      });

      it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.setRelation<TestRelation>(
            'oneTestRelation',
            entity.testEntityPk,
            TEST_RELATIONS[1].testRelationPk,
            {
              relationFilter: { relationName: { like: '%-one' } },
            },
          ),
        ).rejects.toThrow('Unable to find oneTestRelation to set on TestEntity');
      });
    });
  });

  describe('#removeRelations', () => {
    it('call select and return the result', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.removeRelations(
        'testRelations',
        entity.testEntityPk,
        TEST_RELATIONS.slice(0, 3).map((r) => r.testRelationPk),
      );
      expect(queryResult).toEqual(entity);

      const relations = await queryService.queryRelations(TestRelation, 'testRelations', entity, {});
      expect(relations).toHaveLength(0);
    });

    it('should not remove any relations if relationIds is empty', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.removeRelations('testRelations', entity.testEntityPk, []);
      expect(queryResult).toEqual(entity);

      const relations = await queryService.queryRelations(TestRelation, 'testRelations', entity, {});
      expect(relations).toHaveLength(3);
    });

    describe('with modify options', () => {
      it('should throw an error if the entity is not found with the id and provided filter', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.removeRelations(
            'testRelations',
            entity.testEntityPk,
            TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk),
            {
              filter: { stringType: { eq: TEST_ENTITIES[1].stringType } },
            },
          ),
        ).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
      });

      it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.removeRelations<TestRelation>(
            'testRelations',
            entity.testEntityPk,
            TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk),
            {
              relationFilter: { relationName: { like: '%-one' } },
            },
          ),
        ).rejects.toThrow('Unable to find all testRelations to remove from TestEntity');
      });
    });
  });

  describe('#removeRelation', () => {
    describe('oneToOne', () => {
      it('set the relation to null', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.removeRelation(
          'oneTestRelation',
          entity.testEntityPk,
          TEST_RELATIONS[0].testRelationPk,
        );
        expect(queryResult).toEqual(entity);

        const relation = await queryService.findRelation(TestRelation, 'oneTestRelation', entity);
        expect(relation).toBeUndefined();
      });

      describe('with modify options', () => {
        it('should throw an error if the entity is not found with the id and provided filter', async () => {
          const entity = TEST_ENTITIES[0];
          const queryService = moduleRef.get(TestEntityService);
          return expect(
            queryService.removeRelation('oneTestRelation', entity.testEntityPk, TEST_RELATIONS[1].testRelationPk, {
              filter: { stringType: { eq: TEST_ENTITIES[1].stringType } },
            }),
          ).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
        });

        it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
          const entity = TEST_ENTITIES[0];
          const queryService = moduleRef.get(TestEntityService);
          return expect(
            queryService.removeRelation<TestRelation>(
              'oneTestRelation',
              entity.testEntityPk,
              TEST_RELATIONS[1].testRelationPk,
              {
                relationFilter: { relationName: { like: '%-one' } },
              },
            ),
          ).rejects.toThrow('Unable to find oneTestRelation to remove from TestEntity');
        });
      });
    });

    describe('manyToOne', () => {
      it('set the relation to null', async () => {
        const relation = TEST_RELATIONS[0];
        const queryService = moduleRef.get(TestRelationService);
        const queryResult = await queryService.removeRelation(
          'testEntity',
          relation.testRelationPk,
          TEST_ENTITIES[0].testEntityPk,
        );
        expect(queryResult).toMatchObject(relation);

        const entity = await queryService.findRelation(TestEntity, 'testEntity', relation);
        expect(entity).toBeUndefined();
      });

      describe('with modify options', () => {
        it('should throw an error if the entity is not found with the id and provided filter', async () => {
          const relation = TEST_RELATIONS[0];
          const queryService = moduleRef.get(TestRelationService);
          return expect(
            queryService.removeRelation('testEntity', relation.testRelationPk, TEST_ENTITIES[1].testEntityPk, {
              filter: { relationName: { eq: TEST_RELATIONS[1].relationName } },
            }),
          ).rejects.toThrow('Unable to find TestRelation with id: test-relations-test-entity-1-1');
        });

        it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
          const relation = TEST_RELATIONS[0];
          const queryService = moduleRef.get(TestRelationService);
          return expect(
            queryService.removeRelation('testEntity', relation.testRelationPk, TEST_ENTITIES[0].testEntityPk, {
              relationFilter: { stringType: { eq: TEST_ENTITIES[1].stringType } },
            }),
          ).rejects.toThrow('Unable to find testEntity to remove from TestRelation');
        });
      });
    });

    describe('oneToMany', () => {
      it('set the relation to null', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.removeRelation(
          'testRelations',
          entity.testEntityPk,
          TEST_RELATIONS[0].testRelationPk,
        );
        expect(queryResult).toEqual(entity);

        const relations = await queryService.queryRelations(TestRelation, 'testRelations', entity, {});
        expect(relations).toHaveLength(2);
      });

      describe('with modify options', () => {
        it('should throw an error if the entity is not found with the id and provided filter', async () => {
          const entity = TEST_ENTITIES[0];
          const queryService = moduleRef.get(TestEntityService);
          return expect(
            queryService.removeRelation('testRelations', entity.testEntityPk, TEST_RELATIONS[4].testRelationPk, {
              filter: { stringType: { eq: TEST_ENTITIES[1].stringType } },
            }),
          ).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
        });

        it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
          const entity = TEST_ENTITIES[0];
          const queryService = moduleRef.get(TestEntityService);
          return expect(
            queryService.removeRelation<TestRelation>(
              'testRelations',
              entity.testEntityPk,
              TEST_RELATIONS[4].testRelationPk,
              {
                relationFilter: { relationName: { like: '%-one' } },
              },
            ),
          ).rejects.toThrow('Unable to find testRelations to remove from TestEntity');
        });
      });
    });
  });

  describe('#findById', () => {
    it('return the entity if found', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.findById(entity.testEntityPk);
      expect(found).toEqual(entity);
    });

    it('return undefined if not found', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.findById('bad-id');
      expect(found).toBeUndefined();
    });

    describe('with filter', () => {
      it('should return an entity if all filters match', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const found = await queryService.findById(entity.testEntityPk, {
          filter: { stringType: { eq: entity.stringType } },
        });
        expect(found).toEqual(entity);
      });

      it('should return an undefined if an entitity with the pk and filter is not found', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const found = await queryService.findById(entity.testEntityPk, {
          filter: { stringType: { eq: TEST_ENTITIES[1].stringType } },
        });
        expect(found).toBeUndefined();
      });
    });
  });

  describe('#getById', () => {
    it('return the entity if found', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.getById(entity.testEntityPk);
      expect(found).toEqual(entity);
    });

    it('should throw an error if not found', () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.getById('bad-id')).rejects.toThrow('Unable to find TestEntity with id: bad-id');
    });

    describe('with filter', () => {
      it('should return an entity if all filters match', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const found = await queryService.getById(entity.testEntityPk, {
          filter: { stringType: { eq: entity.stringType } },
        });
        expect(found).toEqual(entity);
      });

      it('should return an undefined if an entitity with the pk and filter is not found', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.getById(entity.testEntityPk, {
            filter: { stringType: { eq: TEST_ENTITIES[1].stringType } },
          }),
        ).rejects.toThrow(`Unable to find TestEntity with id: ${entity.testEntityPk}`);
      });
    });
  });

  describe('#createMany', () => {
    it('call save on the repo with instances of entities when passed plain objects', async () => {
      await truncate(getTestConnection());
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createMany(TEST_ENTITIES);
      expect(created).toEqual(TEST_ENTITIES);
    });

    it('call save on the repo with instances of entities when passed instances', async () => {
      await truncate(getTestConnection());
      const instances = TEST_ENTITIES.map((e) => plainToClass(TestEntity, e));
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createMany(instances);
      expect(created).toEqual(instances);
    });

    it('should reject if the entities already exist', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.createMany(TEST_ENTITIES)).rejects.toThrow('Entity already exists');
    });
  });

  describe('#createOne', () => {
    it('call save on the repo with an instance of the entity when passed a plain object', async () => {
      await truncate(getTestConnection());
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createOne(entity);
      expect(created).toEqual(entity);
    });

    it('call save on the repo with an instance of the entity when passed an instance', async () => {
      await truncate(getTestConnection());
      const entity = plainToClass(TestEntity, TEST_ENTITIES[0]);
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createOne(entity);
      expect(created).toEqual(entity);
    });

    it('should reject if the entity contains an id', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.createOne(entity)).rejects.toThrow('Entity already exists');
    });
  });

  describe('#deleteMany', () => {
    it('delete all records that match the query', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const { deletedCount } = await queryService.deleteMany({
        testEntityPk: { in: TEST_ENTITIES.slice(0, 5).map((e) => e.testEntityPk) },
      });
      expect(deletedCount).toEqual(expect.any(Number));
      const allCount = await queryService.count({});
      expect(allCount).toBe(5);
    });
  });

  describe('#deleteOne', () => {
    it('remove the entity', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const deleted = await queryService.deleteOne(TEST_ENTITIES[0].testEntityPk);
      expect(deleted).toEqual({ ...TEST_ENTITIES[0], testEntityPk: undefined });
    });

    it('call fail if the entity is not found', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.deleteOne('bad-id')).rejects.toThrow('Unable to find TestEntity with id: bad-id');
    });

    describe('with filter', () => {
      it('should delete the entity if all filters match', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const deleted = await queryService.deleteOne(entity.testEntityPk, {
          filter: { stringType: { eq: entity.stringType } },
        });
        expect(deleted).toEqual({ ...TEST_ENTITIES[0], testEntityPk: undefined });
      });

      it('should return throw an error if unable to find', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.deleteOne(entity.testEntityPk, {
            filter: { stringType: { eq: TEST_ENTITIES[1].stringType } },
          }),
        ).rejects.toThrow(`Unable to find TestEntity with id: ${entity.testEntityPk}`);
      });
    });
  });

  describe('#updateMany', () => {
    it('update all entities in the filter', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const filter = {
        testEntityPk: { in: TEST_ENTITIES.slice(0, 5).map((e) => e.testEntityPk) },
      };
      await queryService.updateMany({ stringType: 'updated' }, filter);
      const entities = await queryService.query({ filter });
      expect(entities).toHaveLength(5);
      entities.forEach((e) => expect(e.stringType).toBe('updated'));
    });

    it('should reject if the update contains a primary key', () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.updateMany({ testEntityPk: 'updated' }, {})).rejects.toThrow(
        'Id cannot be specified when updating',
      );
    });
  });

  describe('#updateOne', () => {
    it('update the entity', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const updated = await queryService.updateOne(TEST_ENTITIES[0].testEntityPk, { stringType: 'updated' });
      expect(updated).toEqual({ ...TEST_ENTITIES[0], stringType: 'updated' });
    });

    it('should reject if the update contains a primary key', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.updateOne(TEST_ENTITIES[0].testEntityPk, { testEntityPk: 'bad-id' })).rejects.toThrow(
        'Id cannot be specified when updating',
      );
    });

    it('call fail if the entity is not found', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.updateOne('bad-id', { stringType: 'updated' })).rejects.toThrow(
        'Unable to find TestEntity with id: bad-id',
      );
    });

    describe('with filter', () => {
      it('should update the entity if all filters match', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const updated = await queryService.updateOne(
          entity.testEntityPk,
          { stringType: 'updated' },
          { filter: { stringType: { eq: entity.stringType } } },
        );
        expect(updated).toEqual({ ...entity, stringType: 'updated' });
      });

      it('should throw an error if unable to find the entity', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.updateOne(
            entity.testEntityPk,
            { stringType: 'updated' },
            { filter: { stringType: { eq: TEST_ENTITIES[1].stringType } } },
          ),
        ).rejects.toThrow(`Unable to find TestEntity with id: ${entity.testEntityPk}`);
      });
    });
  });

  describe('#isSoftDelete', () => {
    describe('#deleteMany', () => {
      it('should soft delete the entities matching the query', async () => {
        const queryService = moduleRef.get(TestSoftDeleteEntityService);
        const entity = TEST_SOFT_DELETE_ENTITIES[0];
        const deleteMany: Filter<TestSoftDeleteEntity> = { testEntityPk: { eq: entity.testEntityPk } };
        await queryService.deleteMany(deleteMany);
        const foundEntity = await queryService.findById(entity.testEntityPk);
        expect(foundEntity).toBeUndefined();
        const deletedEntity = await queryService.repo.findOne(entity.testEntityPk, { withDeleted: true });
        expect(deletedEntity).toEqual({ ...entity, deletedAt: expect.any(Date) });
      });
    });

    describe('#deleteOne', () => {
      it('should soft delete the entity', async () => {
        const queryService = moduleRef.get(TestSoftDeleteEntityService);
        const entity = TEST_SOFT_DELETE_ENTITIES[0];
        const deleted = await queryService.deleteOne(entity.testEntityPk);
        expect(deleted).toEqual({ ...entity, deletedAt: null });
        const foundEntity = await queryService.findById(entity.testEntityPk);
        expect(foundEntity).toBeUndefined();
        const deletedEntity = await queryService.repo.findOne(entity.testEntityPk, { withDeleted: true });
        expect(deletedEntity).toEqual({ ...entity, deletedAt: expect.any(Date) });
      });

      it('should fail if the entity is not found', async () => {
        const queryService = moduleRef.get(TestSoftDeleteEntityService);
        return expect(queryService.deleteOne('bad-id')).rejects.toThrow(
          'Unable to find TestSoftDeleteEntity with id: bad-id',
        );
      });
    });

    describe('#restoreOne', () => {
      it('restore the entity', async () => {
        const queryService = moduleRef.get(TestSoftDeleteEntityService);
        const entity = TEST_SOFT_DELETE_ENTITIES[0];
        await queryService.deleteOne(entity.testEntityPk);
        const restored = await queryService.restoreOne(entity.testEntityPk);
        expect(restored).toEqual({ ...entity, deletedAt: null });
        const foundEntity = await queryService.findById(entity.testEntityPk);
        expect(foundEntity).toEqual({ ...entity, deletedAt: null });
      });

      it('should fail if the entity is not found', async () => {
        const queryService = moduleRef.get(TestSoftDeleteEntityService);
        return expect(queryService.restoreOne('bad-id')).rejects.toThrow(
          'Unable to find TestSoftDeleteEntity with id: bad-id',
        );
      });

      it('should fail if the useSoftDelete is not enabled', async () => {
        const queryService = moduleRef.get(TestEntityService);
        return expect(queryService.restoreOne(TEST_ENTITIES[0].testEntityPk)).rejects.toThrow(
          'Restore not allowed for non soft deleted entity TestEntity.',
        );
      });

      describe('with filter', () => {
        it('should restore the entity if all filters match', async () => {
          const queryService = moduleRef.get(TestSoftDeleteEntityService);
          const entity = TEST_SOFT_DELETE_ENTITIES[0];
          await queryService.deleteOne(entity.testEntityPk);
          const restored = await queryService.restoreOne(entity.testEntityPk, {
            filter: { stringType: { eq: entity.stringType } },
          });
          expect(restored).toEqual({ ...entity, deletedAt: null });
          const foundEntity = await queryService.findById(entity.testEntityPk);
          expect(foundEntity).toEqual({ ...entity, deletedAt: null });
        });

        it('should return throw an error if unable to find', async () => {
          const queryService = moduleRef.get(TestSoftDeleteEntityService);
          const entity = TEST_SOFT_DELETE_ENTITIES[0];
          await queryService.deleteOne(entity.testEntityPk);
          return expect(
            queryService.restoreOne(entity.testEntityPk, {
              filter: { stringType: { eq: TEST_SOFT_DELETE_ENTITIES[1].stringType } },
            }),
          ).rejects.toThrow(`Unable to find TestSoftDeleteEntity with id: ${entity.testEntityPk}`);
        });
      });
    });

    describe('#restoreMany', () => {
      it('should restore multiple entities', async () => {
        const queryService = moduleRef.get(TestSoftDeleteEntityService);
        const entity = TEST_SOFT_DELETE_ENTITIES[0];
        const filter: Filter<TestSoftDeleteEntity> = { testEntityPk: { eq: entity.testEntityPk } };
        await queryService.deleteMany(filter);
        await queryService.restoreMany(filter);
        const foundEntity = await queryService.findById(entity.testEntityPk);
        expect(foundEntity).toEqual({ ...entity, deletedAt: null });
      });

      it('should fail if the useSoftDelete is not enabled', async () => {
        const queryService = moduleRef.get(TestEntityService);
        return expect(queryService.restoreMany({ stringType: { eq: 'foo' } })).rejects.toThrow(
          'Restore not allowed for non soft deleted entity TestEntity.',
        );
      });
    });
  });
});
