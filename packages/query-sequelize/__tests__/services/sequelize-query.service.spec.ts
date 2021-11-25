import { DeepPartial } from '@nestjs-query/core';
import { Test, TestingModule } from '@nestjs/testing';
import { InjectModel, SequelizeModule } from '@nestjs/sequelize';
import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { SequelizeQueryService } from '../../src';
import { FilterQueryBuilder } from '../../src/query';
import { CONNECTION_OPTIONS, refresh, truncate } from '../__fixtures__/sequelize.fixture';
import { PLAIN_TEST_ENTITIES, PLAIN_TEST_RELATIONS } from '../__fixtures__/seeds';
import { TestEntityTestRelationEntity } from '../__fixtures__/test-entity-test-relation.entity';
import { TestRelation } from '../__fixtures__/test-relation.entity';
import { TestEntity } from '../__fixtures__/test.entity';

describe('SequelizeQueryService', (): void => {
  let moduleRef: TestingModule;

  class TestEntityService extends SequelizeQueryService<TestEntity> {
    constructor(@InjectModel(TestEntity) readonly model: ModelCtor<TestEntity>) {
      super(model);
    }
  }

  class TestRelationService extends SequelizeQueryService<TestRelation> {
    constructor(@InjectModel(TestRelation) readonly model: ModelCtor<TestRelation>) {
      super(model);
    }
  }

  afterEach(() => moduleRef.get(Sequelize).close());

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot(CONNECTION_OPTIONS),
        SequelizeModule.forFeature([TestEntity, TestRelation, TestEntityTestRelationEntity]),
      ],
      providers: [TestEntityService, TestRelationService],
    }).compile();
    const sequelize = moduleRef.get(Sequelize);
    await sequelize.sync();
    await refresh(sequelize);
  });

  it('should create a filterQueryBuilder and assemblerService based on the repo passed in if not provided', () => {
    const queryService = moduleRef.get(TestEntityService);
    expect(queryService.filterQueryBuilder).toBeInstanceOf(FilterQueryBuilder);
  });

  describe('#query', () => {
    it('call select and return the result', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { eq: 'foo1' } } });
      return expect(queryResult.map((e) => e.get({ plain: true }))).toEqual([PLAIN_TEST_ENTITIES[0]]);
    });
    describe('filter on relations', () => {
      describe('oneToOne', () => {
        it('should allow filtering on a one to one relation', async () => {
          const entity = PLAIN_TEST_ENTITIES[0];
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
          expect(queryResult.map((e) => e.get({ plain: true }))).toEqual([entity]);
        });
      });

      describe('manyToOne', () => {
        it('should allow filtering on a many to one relation', async () => {
          const queryService = moduleRef.get(TestRelationService);
          const queryResults = await queryService.query({
            filter: {
              testEntity: {
                testEntityPk: {
                  in: [PLAIN_TEST_ENTITIES[0].testEntityPk, PLAIN_TEST_ENTITIES[1].testEntityPk],
                },
              },
            },
          });
          expect(queryResults.map((e) => e.get({ plain: true }))).toEqual(PLAIN_TEST_RELATIONS.slice(0, 6));
        });
      });

      describe('oneToMany', () => {
        it('should allow filtering on a many to one relation', async () => {
          const entity = PLAIN_TEST_ENTITIES[0];
          const queryService = moduleRef.get(TestEntityService);
          const queryResult = await queryService.query({
            filter: {
              testRelations: {
                relationName: {
                  in: [PLAIN_TEST_RELATIONS[0].relationName, PLAIN_TEST_RELATIONS[1].relationName],
                },
              },
            },
          });
          expect(queryResult.map((e) => e.get({ plain: true }))).toEqual([entity]);
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
        it('should properly count the number of records with the associated relations', async () => {
          const entity = PLAIN_TEST_ENTITIES[0];
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
                in: [PLAIN_TEST_ENTITIES[0].testEntityPk, PLAIN_TEST_ENTITIES[2].testEntityPk],
              },
            },
          });
          expect(count).toBe(6);
        });
      });

      describe('oneToMany', () => {
        it('set the relation to null', async () => {
          const relation = PLAIN_TEST_RELATIONS[0];
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
        const queryResult = await queryService.queryRelations(
          TestRelation,
          'testRelations',
          TestEntity.build(PLAIN_TEST_ENTITIES[0]),
          {
            filter: { relationName: { isNot: null } },
          },
        );
        return expect(queryResult.map((r) => r.testEntityId)).toEqual([
          PLAIN_TEST_ENTITIES[0].testEntityPk,
          PLAIN_TEST_ENTITIES[0].testEntityPk,
          PLAIN_TEST_ENTITIES[0].testEntityPk,
        ]);
      });
    });

    describe('with multiple entities', () => {
      it('call select and return the result', async () => {
        const entities = PLAIN_TEST_ENTITIES.slice(0, 3).map((pe) => TestEntity.build(pe));
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestRelation, 'testRelations', entities, {
          filter: { relationName: { isNot: null } },
        });

        expect(queryResult.size).toBe(3);
        entities.forEach((e) => expect(queryResult.get(e)).toHaveLength(3));
      });

      it('should return an empty array if no results are found.', async () => {
        const entities: TestEntity[] = [
          PLAIN_TEST_ENTITIES[0] as TestEntity,
          { testEntityPk: 'does-not-exist' } as TestEntity,
        ];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestRelation, 'testRelations', entities, {
          filter: { relationName: { isNot: null } },
        });

        expect(queryResult.size).toBe(2);
        expect(queryResult.get(entities[0])).toHaveLength(3);
        expect(queryResult.get(entities[1])).toHaveLength(0);
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
          TestEntity.build(PLAIN_TEST_ENTITIES[0]),
          { relationName: { isNot: null } },
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
    });

    describe('with multiple entities', () => {
      it('call select and return the result', async () => {
        const entities = PLAIN_TEST_ENTITIES.slice(0, 3).map((pe) => TestEntity.build(pe));
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
        const entities = PLAIN_TEST_ENTITIES.slice(0, 3).map((pe) => TestEntity.build(pe));
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

      it('should return an empty array if no results are found.', async () => {
        const entities: TestEntity[] = [
          PLAIN_TEST_ENTITIES[0] as TestEntity,
          { testEntityPk: 'does-not-exist' } as TestEntity,
        ];
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
        const entity = TestEntity.build(PLAIN_TEST_ENTITIES[0]);
        const countResult = await queryService.countRelations(TestRelation, 'testRelations', entity, {
          relationName: { isNot: null },
        });
        return expect(countResult).toBe(3);
      });
    });

    describe('with multiple entities', () => {
      it('call count and return the result', async () => {
        const entities = PLAIN_TEST_ENTITIES.slice(0, 3).map((pe) => TestEntity.build(pe));
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
        const entity = TestEntity.build(PLAIN_TEST_ENTITIES[0]);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestRelation, 'oneTestRelation', entity);

        expect(queryResult!.get({ plain: true })).toEqual(PLAIN_TEST_RELATIONS[0]);
      });

      it('apply the filter option', async () => {
        const entity = TestEntity.build(PLAIN_TEST_ENTITIES[0]);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult1 = await queryService.findRelation(TestRelation, 'oneTestRelation', entity, {
          filter: { relationName: { eq: PLAIN_TEST_RELATIONS[0].relationName } },
        });
        expect(queryResult1!.get({ plain: true })).toEqual(PLAIN_TEST_RELATIONS[0]);

        const queryResult2 = await queryService.findRelation(TestRelation, 'oneTestRelation', entity, {
          filter: { relationName: { eq: PLAIN_TEST_RELATIONS[1].relationName } },
        });
        expect(queryResult2).toBeUndefined();
      });

      it('should return undefined select if no results are found.', async () => {
        const entity = { ...PLAIN_TEST_ENTITIES[0], testEntityPk: 'not-real' } as TestEntity;
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestRelation, 'oneTestRelation', entity);

        expect(queryResult).toBeUndefined();
      });

      it('throw an error if a relation with that name is not found.', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const entity = TestEntity.build(PLAIN_TEST_ENTITIES[0]);
        return expect(queryService.findRelation(TestRelation, 'badRelation', entity)).rejects.toThrow(
          'Unable to find relation badRelation on TestEntity',
        );
      });
    });

    describe('with multiple entities', () => {
      it('call select and return the result', async () => {
        const entities = PLAIN_TEST_ENTITIES.slice(0, 3).map((pe) => TestEntity.build(pe));
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestRelation, 'oneTestRelation', entities);

        expect(queryResult).toEqual(
          new Map([
            [entities[0], expect.objectContaining(PLAIN_TEST_RELATIONS[0])],
            [entities[1], expect.objectContaining(PLAIN_TEST_RELATIONS[3])],
            [entities[2], expect.objectContaining(PLAIN_TEST_RELATIONS[6])],
          ]),
        );
      });

      it('should apply the filter option', async () => {
        const entities = PLAIN_TEST_ENTITIES.slice(0, 3).map((pe) => TestEntity.build(pe));
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestRelation, 'oneTestRelation', entities, {
          filter: {
            testRelationPk: { in: [PLAIN_TEST_RELATIONS[0].testRelationPk, PLAIN_TEST_RELATIONS[6].testRelationPk] },
          },
        });
        expect(queryResult).toEqual(
          new Map([
            [entities[0], expect.objectContaining(PLAIN_TEST_RELATIONS[0])],
            [entities[2], expect.objectContaining(PLAIN_TEST_RELATIONS[6])],
          ]),
        );
      });

      it('should return undefined select if no results are found.', async () => {
        const entities: TestEntity[] = [
          PLAIN_TEST_ENTITIES[0] as TestEntity,
          { testEntityPk: 'does-not-exist' } as TestEntity,
        ];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestRelation, 'oneTestRelation', entities);

        expect(queryResult).toEqual(new Map([[entities[0], expect.objectContaining(PLAIN_TEST_RELATIONS[0])]]));
      });
    });
  });

  describe('#addRelations', () => {
    it('call select and return the result', async () => {
      const entity = PLAIN_TEST_ENTITIES[0] as TestEntity;
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.addRelations(
        'testRelations',
        entity.testEntityPk,
        PLAIN_TEST_RELATIONS.slice(3, 6).map((r) => (r as TestRelation).testRelationPk),
      );
      expect(queryResult).toEqual(expect.objectContaining(entity));

      const relations = await queryService.queryRelations(TestRelation, 'testRelations', entity, {});
      expect(relations).toHaveLength(6);
    });

    it('should not modify relations if the relationIds is empty', async () => {
      const entity = PLAIN_TEST_ENTITIES[0] as TestEntity;
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.addRelations('testRelations', entity.testEntityPk, []);
      expect(queryResult).toEqual(expect.objectContaining(entity));

      const relations = await queryService.queryRelations(TestRelation, 'testRelations', entity, {});
      expect(relations).toHaveLength(3);
    });

    describe('with modify options', () => {
      it('should throw an error if the entity is not found with the id and provided filter', async () => {
        const entity = PLAIN_TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.addRelations(
            'testRelations',
            entity.testEntityPk,
            PLAIN_TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk),
            {
              filter: { stringType: { eq: PLAIN_TEST_ENTITIES[1].stringType } },
            },
          ),
        ).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
      });

      it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
        const entity = PLAIN_TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.addRelations<TestRelation>(
            'testRelations',
            entity.testEntityPk,
            PLAIN_TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk),
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
      const entity = PLAIN_TEST_ENTITIES[0] as TestEntity;
      const queryService = moduleRef.get(TestEntityService);
      const relationIds = PLAIN_TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk);
      const queryResult = await queryService.setRelations('testRelations', entity.testEntityPk, relationIds);
      expect(queryResult).toEqual(expect.objectContaining(entity));

      const relations = await queryService.queryRelations(TestRelation, 'testRelations', entity, {});
      expect(relations.map((r) => r.testRelationPk)).toEqual(relationIds);
    });

    it('should remove all relations if the relationIds is empty', async () => {
      const entity = PLAIN_TEST_ENTITIES[0] as TestEntity;
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.setRelations('testRelations', entity.testEntityPk, []);
      expect(queryResult).toEqual(expect.objectContaining(entity));

      const relations = await queryService.queryRelations(TestRelation, 'testRelations', entity, {});
      expect(relations.map((r) => r.testRelationPk)).toEqual([]);
    });

    describe('with modify options', () => {
      it('should throw an error if the entity is not found with the id and provided filter', async () => {
        const entity = PLAIN_TEST_ENTITIES[0] as TestEntity;
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.setRelations(
            'testRelations',
            entity.testEntityPk,
            PLAIN_TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk),
            {
              filter: { stringType: { eq: PLAIN_TEST_ENTITIES[1].stringType } },
            },
          ),
        ).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
      });

      it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
        const entity = PLAIN_TEST_ENTITIES[0] as TestEntity;
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.setRelations<TestRelation>(
            'testRelations',
            entity.testEntityPk,
            PLAIN_TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk),
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
      const entity = PLAIN_TEST_ENTITIES[0] as TestEntity;
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.setRelation(
        'oneTestRelation',
        entity.testEntityPk,
        PLAIN_TEST_RELATIONS[1].testRelationPk,
      );
      expect(queryResult).toEqual(expect.objectContaining(entity));

      const relation = await queryService.findRelation(TestRelation, 'oneTestRelation', entity);
      expect(relation!.testRelationPk).toBe(PLAIN_TEST_RELATIONS[1].testRelationPk);
    });

    describe('with modify options', () => {
      it('should throw an error if the entity is not found with the id and provided filter', async () => {
        const entity = PLAIN_TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.setRelation('oneTestRelation', entity.testEntityPk, PLAIN_TEST_RELATIONS[1].testRelationPk, {
            filter: { stringType: { eq: PLAIN_TEST_ENTITIES[1].stringType } },
          }),
        ).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
      });

      it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
        const entity = PLAIN_TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.setRelation<TestRelation>(
            'oneTestRelation',
            entity.testEntityPk,
            PLAIN_TEST_RELATIONS[1].testRelationPk,
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
      const entity = PLAIN_TEST_ENTITIES[0] as TestEntity;
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.removeRelations(
        'testRelations',
        entity.testEntityPk,
        PLAIN_TEST_RELATIONS.slice(0, 3).map((r) => r.testRelationPk),
      );
      expect(queryResult).toEqual(expect.objectContaining(entity));

      const relations = await queryService.queryRelations(TestRelation, 'testRelations', entity, {});
      expect(relations).toHaveLength(0);
    });

    it('should not modify relations if relationIds is empty', async () => {
      const entity = PLAIN_TEST_ENTITIES[0] as TestEntity;
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.removeRelations('testRelations', entity.testEntityPk, []);
      expect(queryResult).toEqual(expect.objectContaining(entity));

      const relations = await queryService.queryRelations(TestRelation, 'testRelations', entity, {});
      expect(relations).toHaveLength(3);
    });

    describe('with modify options', () => {
      it('should throw an error if the entity is not found with the id and provided filter', async () => {
        const entity = PLAIN_TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.removeRelations(
            'testRelations',
            entity.testEntityPk,
            PLAIN_TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk),
            {
              filter: { stringType: { eq: PLAIN_TEST_ENTITIES[1].stringType } },
            },
          ),
        ).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
      });

      it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
        const entity = PLAIN_TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.removeRelations<TestRelation>(
            'testRelations',
            entity.testEntityPk,
            PLAIN_TEST_RELATIONS.slice(3, 6).map((r) => r.testRelationPk),
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
        const entity = PLAIN_TEST_ENTITIES[0] as TestEntity;
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.removeRelation(
          'oneTestRelation',
          entity.testEntityPk,
          PLAIN_TEST_RELATIONS[0].testRelationPk,
        );
        expect(queryResult).toEqual(expect.objectContaining(entity));

        const relation = await queryService.findRelation(TestRelation, 'oneTestRelation', entity);
        expect(relation).toBeUndefined();
      });

      describe('with modify options', () => {
        it('should throw an error if the entity is not found with the id and provided filter', async () => {
          const entity = PLAIN_TEST_ENTITIES[0];
          const queryService = moduleRef.get(TestEntityService);
          return expect(
            queryService.removeRelation(
              'oneTestRelation',
              entity.testEntityPk,
              PLAIN_TEST_RELATIONS[1].testRelationPk,
              {
                filter: { stringType: { eq: PLAIN_TEST_ENTITIES[1].stringType } },
              },
            ),
          ).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
        });

        it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
          const entity = PLAIN_TEST_ENTITIES[0];
          const queryService = moduleRef.get(TestEntityService);
          return expect(
            queryService.removeRelation<TestRelation>(
              'oneTestRelation',
              entity.testEntityPk,
              PLAIN_TEST_RELATIONS[1].testRelationPk,
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
        const relation = PLAIN_TEST_RELATIONS[0] as TestRelation;
        const queryService = moduleRef.get(TestRelationService);
        const queryResult = await queryService.removeRelation(
          'testEntity',
          relation.testRelationPk,
          PLAIN_TEST_ENTITIES[0].testEntityPk,
        );
        expect(queryResult).toEqual(expect.objectContaining({ ...relation, testEntityId: null }));

        const entity = await queryService.findRelation(TestEntity, 'testEntity', queryResult);
        expect(entity).toBeUndefined();
      });

      describe('with modify options', () => {
        it('should throw an error if the entity is not found with the id and provided filter', async () => {
          const relation = PLAIN_TEST_RELATIONS[0];
          const queryService = moduleRef.get(TestRelationService);
          return expect(
            queryService.removeRelation('testEntity', relation.testRelationPk, PLAIN_TEST_ENTITIES[1].testEntityPk, {
              filter: { relationName: { eq: PLAIN_TEST_RELATIONS[1].relationName } },
            }),
          ).rejects.toThrow('Unable to find TestRelation with id: test-relations-test-entity-1-1');
        });

        it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
          const relation = PLAIN_TEST_RELATIONS[0];
          const queryService = moduleRef.get(TestRelationService);
          return expect(
            queryService.removeRelation('testEntity', relation.testRelationPk, PLAIN_TEST_ENTITIES[0].testEntityPk, {
              relationFilter: { stringType: { eq: PLAIN_TEST_ENTITIES[1].stringType } },
            }),
          ).rejects.toThrow('Unable to find testEntity to remove from TestRelation');
        });
      });
    });

    describe('oneToMany', () => {
      it('set the relation to null', async () => {
        const entity = PLAIN_TEST_ENTITIES[0] as TestEntity;
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.removeRelation(
          'testRelations',
          entity.testEntityPk,
          PLAIN_TEST_RELATIONS[0].testRelationPk,
        );
        expect(queryResult).toEqual(expect.objectContaining(entity));

        const relations = await queryService.queryRelations(TestRelation, 'testRelations', entity, {});
        expect(relations).toHaveLength(2);
      });

      describe('with modify options', () => {
        it('should throw an error if the entity is not found with the id and provided filter', async () => {
          const entity = PLAIN_TEST_ENTITIES[0];
          const queryService = moduleRef.get(TestEntityService);
          return expect(
            queryService.removeRelation('testRelations', entity.testEntityPk, PLAIN_TEST_RELATIONS[4].testRelationPk, {
              filter: { stringType: { eq: PLAIN_TEST_ENTITIES[1].stringType } },
            }),
          ).rejects.toThrow('Unable to find TestEntity with id: test-entity-1');
        });

        it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
          const entity = PLAIN_TEST_ENTITIES[0];
          const queryService = moduleRef.get(TestEntityService);
          return expect(
            queryService.removeRelation<TestRelation>(
              'testRelations',
              entity.testEntityPk,
              PLAIN_TEST_RELATIONS[4].testRelationPk,
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
      const entity = PLAIN_TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.findById(entity.testEntityPk);
      expect(found).toEqual(expect.objectContaining(entity));
    });

    it('return undefined if not found', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.findById('bad-id');
      expect(found).toBeUndefined();
    });

    describe('with filter', () => {
      it('should return an entity if all filters match', async () => {
        const entity = PLAIN_TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const found = await queryService.findById(entity.testEntityPk, {
          filter: { stringType: { eq: entity.stringType } },
        });
        expect(found).toEqual(expect.objectContaining(entity));
      });

      it('should return an undefined if an entitity with the pk and filter is not found', async () => {
        const entity = PLAIN_TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const found = await queryService.findById(entity.testEntityPk, {
          filter: { stringType: { eq: PLAIN_TEST_ENTITIES[1].stringType } },
        });
        expect(found).toBeUndefined();
      });
    });
  });

  describe('#getById', () => {
    it('return the entity if found', async () => {
      const entity = PLAIN_TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.getById(entity.testEntityPk);
      expect(found).toEqual(expect.objectContaining(entity));
    });

    it('should throw an error if the record is not found', () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.getById('bad-id')).rejects.toThrow('Unable to find TestEntity with id: bad-id');
    });

    describe('with filter', () => {
      it('should return an entity if all filters match', async () => {
        const entity = PLAIN_TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const found = await queryService.getById(entity.testEntityPk, {
          filter: { stringType: { eq: entity.stringType } },
        });
        expect(found).toEqual(expect.objectContaining(entity));
      });

      it('should return an undefined if an entitity with the pk and filter is not found', async () => {
        const entity = PLAIN_TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.getById(entity.testEntityPk, {
            filter: { stringType: { eq: PLAIN_TEST_ENTITIES[1].stringType } },
          }),
        ).rejects.toThrow(`Unable to find TestEntity with id: ${entity.testEntityPk}`);
      });
    });
  });

  describe('#createMany', () => {
    it('call save on the repo with instances of entities when passed plain objects', async () => {
      await truncate(moduleRef.get(Sequelize));
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createMany(PLAIN_TEST_ENTITIES);
      expect(created.map((c) => c.get({ plain: true }))).toEqual(expect.objectContaining(PLAIN_TEST_ENTITIES));
    });

    it('call save on the repo with instances of entities when passed instances', async () => {
      await truncate(moduleRef.get(Sequelize));
      const queryService = moduleRef.get(TestEntityService);
      const entities = PLAIN_TEST_ENTITIES.map((pe) => TestEntity.build(pe));
      const created = await queryService.createMany(entities as DeepPartial<TestEntity>[]);
      expect(created.map((c) => c.get({ plain: true }))).toEqual(PLAIN_TEST_ENTITIES);
    });

    it('should reject if the entities already exist', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.createMany(PLAIN_TEST_ENTITIES)).rejects.toThrow('Entity already exists');
    });
  });

  describe('#createOne', () => {
    it('call save on the repo with an instance of the entity when passed a plain object', async () => {
      await truncate(moduleRef.get(Sequelize));
      const entity = PLAIN_TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createOne(entity);
      expect(created).toEqual(expect.objectContaining(entity));
    });

    it('call save on the repo with an instance of the entity when passed an instance', async () => {
      await truncate(moduleRef.get(Sequelize));
      const entity = PLAIN_TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createOne(entity as DeepPartial<TestEntity>);
      expect(created).toEqual(expect.objectContaining(entity));
    });

    it('should reject if the entity contains an id', async () => {
      const entity = PLAIN_TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.createOne(entity)).rejects.toThrow('Entity already exists');
    });
  });

  describe('#deleteMany', () => {
    it('delete all records that match the query', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const { deletedCount } = await queryService.deleteMany({
        testEntityPk: { in: PLAIN_TEST_ENTITIES.slice(0, 5).map((e) => e.testEntityPk) },
      });
      expect(deletedCount).toBe(5);
      const allCount = await queryService.count({});
      expect(allCount).toBe(5);
    });
  });

  describe('#deleteOne', () => {
    it('remove the entity', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const deleted = await queryService.deleteOne(PLAIN_TEST_ENTITIES[0].testEntityPk);
      expect(deleted).toEqual(expect.objectContaining(PLAIN_TEST_ENTITIES[0]));
    });

    it('call fail if the entity is not found', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.deleteOne('bad-id')).rejects.toThrow('Unable to find TestEntity with id: bad-id');
    });

    describe('with filter', () => {
      it('should delete the entity if all filters match', async () => {
        const entity = PLAIN_TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const deleted = await queryService.deleteOne(entity.testEntityPk, {
          filter: { stringType: { eq: entity.stringType } },
        });
        expect(deleted).toEqual(expect.objectContaining(PLAIN_TEST_ENTITIES[0]));
      });

      it('should return throw an error if unable to find', async () => {
        const entity = PLAIN_TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.deleteOne(entity.testEntityPk, {
            filter: { stringType: { eq: PLAIN_TEST_ENTITIES[1].stringType } },
          }),
        ).rejects.toThrow(`Unable to find TestEntity with id: ${entity.testEntityPk}`);
      });
    });
  });

  describe('#updateMany', () => {
    it('update all entities in the filter', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const filter = {
        testEntityPk: { in: PLAIN_TEST_ENTITIES.slice(0, 5).map((e) => e.testEntityPk) },
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
      const updated = await queryService.updateOne(PLAIN_TEST_ENTITIES[0].testEntityPk, { stringType: 'updated' });
      expect(updated).toEqual(expect.objectContaining({ ...PLAIN_TEST_ENTITIES[0], stringType: 'updated' }));
    });

    it('should reject if the update contains a primary key', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(
        queryService.updateOne(PLAIN_TEST_ENTITIES[0].testEntityPk, { testEntityPk: 'bad-id' }),
      ).rejects.toThrow('Id cannot be specified when updating');
    });

    it('call fail if the entity is not found', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.updateOne('bad-id', { stringType: 'updated' })).rejects.toThrow(
        'Unable to find TestEntity with id: bad-id',
      );
    });

    describe('with filter', () => {
      it('should update the entity if all filters match', async () => {
        const entity = PLAIN_TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const updated = await queryService.updateOne(
          entity.testEntityPk,
          { stringType: 'updated' },
          { filter: { stringType: { eq: entity.stringType } } },
        );
        expect(updated).toEqual(expect.objectContaining({ ...PLAIN_TEST_ENTITIES[0], stringType: 'updated' }));
      });

      it('should throw an error if unable to find the entity', async () => {
        const entity = PLAIN_TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.updateOne(
            entity.testEntityPk,
            { stringType: 'updated' },
            { filter: { stringType: { eq: PLAIN_TEST_ENTITIES[1].stringType } } },
          ),
        ).rejects.toThrow(`Unable to find TestEntity with id: ${entity.testEntityPk}`);
      });
    });
  });
});
