import { Filter } from '@nestjs-query/core';
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
          expect(queryResults).toEqual(TEST_RELATIONS.slice(0, 6));
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
      return expect(queryResult).toEqual({
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
      });
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
      return expect(queryResult).toEqual({
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
      });
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
          expect(count).toEqual(1);
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
          expect(count).toEqual(6);
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
          expect(count).toEqual(1);
        });
      });
    });
  });

  describe('#queryRelations', () => {
    describe('with one entity', () => {
      it('call select and return the result', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestRelation, 'testRelations', TEST_ENTITIES[0], {
          filter: { relationName: { isNot: null } },
        });
        return expect(queryResult.map((r) => r.testEntityId)).toEqual([
          TEST_ENTITIES[0].testEntityPk,
          TEST_ENTITIES[0].testEntityPk,
          TEST_ENTITIES[0].testEntityPk,
        ]);
      });
    });

    describe('with multiple entities', () => {
      it('call select and return the result', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestRelation, 'testRelations', entities, {
          filter: { relationName: { isNot: null } },
        });

        expect(queryResult.size).toBe(3);
        entities.forEach((e) => expect(queryResult.get(e)).toHaveLength(3));
      });

      it('should return an empty array if no results are found.', async () => {
        const entities: TestEntity[] = [TEST_ENTITIES[0], { testEntityPk: 'does-not-exist' } as TestEntity];
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
          TEST_ENTITIES[0],
          { relationName: { isNot: null } },
          { count: ['testRelationPk'] },
        );
        return expect(aggResult).toEqual({
          count: {
            testRelationPk: 3,
          },
        });
      });
    });

    describe('with multiple entities', () => {
      it('call select and return the result', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
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
              {
                count: {
                  relationName: 3,
                  testEntityId: 3,
                  testRelationPk: 3,
                },
                max: {
                  relationName: 'foo1-test-relation',
                  testEntityId: 'test-entity-1',
                  testRelationPk: 'test-relations-test-entity-1-3',
                },
                min: {
                  relationName: 'foo1-test-relation',
                  testEntityId: 'test-entity-1',
                  testRelationPk: 'test-relations-test-entity-1-1',
                },
              },
            ],
            [
              entities[1],
              {
                count: {
                  relationName: 3,
                  testEntityId: 3,
                  testRelationPk: 3,
                },
                max: {
                  relationName: 'foo2-test-relation',
                  testEntityId: 'test-entity-2',
                  testRelationPk: 'test-relations-test-entity-2-3',
                },
                min: {
                  relationName: 'foo2-test-relation',
                  testEntityId: 'test-entity-2',
                  testRelationPk: 'test-relations-test-entity-2-1',
                },
              },
            ],
            [
              entities[2],
              {
                count: {
                  relationName: 3,
                  testEntityId: 3,
                  testRelationPk: 3,
                },
                max: {
                  relationName: 'foo3-test-relation',
                  testEntityId: 'test-entity-3',
                  testRelationPk: 'test-relations-test-entity-3-3',
                },
                min: {
                  relationName: 'foo3-test-relation',
                  testEntityId: 'test-entity-3',
                  testRelationPk: 'test-relations-test-entity-3-1',
                },
              },
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
              {
                count: {
                  relationName: 3,
                  testEntityId: 3,
                  testRelationPk: 3,
                },
                max: {
                  relationName: 'foo1-test-relation',
                  testEntityId: 'test-entity-1',
                  testRelationPk: 'test-relations-test-entity-1-3',
                },
                min: {
                  relationName: 'foo1-test-relation',
                  testEntityId: 'test-entity-1',
                  testRelationPk: 'test-relations-test-entity-1-1',
                },
              },
            ],
            [
              { testEntityPk: 'does-not-exist' } as TestEntity,
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
        return expect(countResult).toEqual(3);
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

        expect(queryResult).toEqual(TEST_RELATIONS[0]);
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
    });

    describe('with multiple entities', () => {
      it('call select and return the result', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestRelation, 'oneTestRelation', entities);

        expect(queryResult).toEqual(
          new Map([
            [entities[0], TEST_RELATIONS[0]],
            [entities[1], TEST_RELATIONS[3]],
            [entities[2], TEST_RELATIONS[6]],
          ]),
        );
      });

      it('should return undefined select if no results are found.', async () => {
        const entities: TestEntity[] = [TEST_ENTITIES[0], { testEntityPk: 'does-not-exist' } as TestEntity];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestRelation, 'oneTestRelation', entities);

        expect(queryResult).toEqual(
          new Map([
            [entities[0], TEST_RELATIONS[0]],
            [entities[1], undefined],
          ]),
        );
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
        expect(queryResult).toEqual(relation);

        const entity = await queryService.findRelation(TestEntity, 'testEntity', relation);
        expect(entity).toBeUndefined();
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
  });

  describe('#getById', () => {
    it('return the entity if found', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.getById(entity.testEntityPk);
      expect(found).toEqual(entity);
    });

    it('return undefined if not found', () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.getById('bad-id')).rejects.toThrow('Unable to find TestEntity with id: bad-id');
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
      return expect(queryService.deleteOne('bad-id')).rejects.toThrow(
        'Could not find any entity of type "TestEntity" matching: "bad-id"',
      );
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
        'Could not find any entity of type "TestEntity" matching: "bad-id"',
      );
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
          'Could not find any entity of type "TestSoftDeleteEntity" matching: "bad-id"',
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
