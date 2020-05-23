import { DeepPartial, Filter, Query, QueryService } from '@nestjs-query/core';
import { FindOptions } from 'sequelize';
import { instance, mock, when, objectContaining, deepEqual } from 'ts-mockito';
import { ModelCtor } from 'sequelize-typescript';
import { SequelizeQueryService } from '../../src';
import { FilterQueryBuilder } from '../../src/query';
import { closeSequelize, syncSequelize } from '../__fixtures__/sequelize.fixture';
import { TestEntity } from '../__fixtures__/test.entity';
import { TestRelation } from '../__fixtures__/test-relation.entity';

describe('SequelizeQueryService', (): void => {
  beforeAll(() => syncSequelize());

  afterAll(() => closeSequelize());

  const plainEntities = [
    {
      testEntityPk: 'entity-id1',
      stringType: 'foo',
      boolType: true,
      dateType: new Date(),
      numberType: 1,
    },
    {
      testEntityPk: 'entity-id2',
      stringType: 'bar',
      boolType: false,
      dateType: new Date(),
      numberType: 2,
    },
  ];

  const testEntities = (): TestEntity[] => plainEntities.map((e) => new TestEntity(e));

  const testRelations = (entityId: string): TestRelation[] => [
    new TestRelation({ testRelationPk: `relation-${entityId}-id1`, relationName: 'name 1', testEntityId: entityId }),
    new TestRelation({ testRelationPk: `relation-${entityId}-id2`, relationName: 'name 2', testEntityId: entityId }),
  ];

  @QueryService(TestEntity)
  class TestSequelizeQueryService extends SequelizeQueryService<TestEntity> {
    constructor(
      readonly model: ModelCtor<TestEntity>,
      filterQueryBuilder?: FilterQueryBuilder<TestEntity>,
      readonly relationFilterQueryBuilder?: FilterQueryBuilder<TestRelation>,
    ) {
      super(model, filterQueryBuilder);
    }

    getRelationQueryBuilder<Relation>(): FilterQueryBuilder<Relation> {
      return (this.relationFilterQueryBuilder as unknown) as FilterQueryBuilder<Relation>;
    }
  }

  type MockQueryService<Relation = unknown> = {
    mockModelCtor: ModelCtor<TestEntity>;
    queryService: QueryService<TestEntity>;
    mockQueryBuilder: FilterQueryBuilder<TestEntity>;
    mockRelationQueryBuilder: FilterQueryBuilder<TestRelation>;
  };

  function createQueryService<Relation = unknown>(): MockQueryService<Relation> {
    const mockQueryBuilder = mock<FilterQueryBuilder<TestEntity>>(FilterQueryBuilder);
    const mockRelationQueryBuilder = mock<FilterQueryBuilder<TestRelation>>(FilterQueryBuilder);
    const mockModel = mock<ModelCtor<TestEntity>>();
    const queryService = new TestSequelizeQueryService(
      instance(mockModel),
      instance(mockQueryBuilder),
      instance(mockRelationQueryBuilder),
    );
    return { mockQueryBuilder, mockModelCtor: mockModel, queryService, mockRelationQueryBuilder };
  }

  describe('#query', () => {
    it('call select and return the result', async () => {
      const entities = testEntities();
      const query: Query<TestEntity> = { filter: { stringType: { eq: 'foo' } } };
      const findOptions: FindOptions = {};
      const { queryService, mockQueryBuilder, mockModelCtor } = createQueryService();
      when(mockQueryBuilder.findOptions(query)).thenReturn(findOptions);
      when(mockModelCtor.findAll(findOptions)).thenResolve(entities);
      const queryResult = await queryService.query(query);
      return expect(queryResult).toEqual(entities);
    });
  });

  describe('#queryRelations', () => {
    const relationName = 'testRelations';
    describe('with one entity', () => {
      it('call select and return the result', async () => {
        const entity = testEntities()[0];
        const relations = testRelations(entity.testEntityPk);
        const query: Query<TestRelation> = { filter: { relationName: { eq: 'name' } } };
        const findOptions: FindOptions = {};
        const mockModel = mock(TestEntity);
        const mockModelInstance = instance(mockModel);
        const { queryService, mockModelCtor, mockRelationQueryBuilder } = createQueryService<TestRelation>();
        // @ts-ignore
        when(mockModelCtor.associations).thenReturn({ [relationName]: { target: TestRelation } });
        when(mockModelCtor.build(mockModelInstance)).thenReturn(mockModelInstance);
        when(mockRelationQueryBuilder.findOptions(query)).thenReturn(findOptions);
        when(mockModel.$get(relationName, findOptions)).thenResolve(relations);
        const queryResult = await queryService.queryRelations(TestRelation, relationName, instance(mockModel), query);
        return expect(queryResult).toEqual(relations);
      });
    });
    describe('with multiple entities', () => {
      it('call select and return the result', async () => {
        const entities = testEntities();
        const entityOneRelations = testRelations(entities[0].testEntityPk);
        const entityTwoRelations = testRelations(entities[1].testEntityPk);
        const query = {
          paging: { limit: 2 },
        };
        const findOptions: FindOptions = {};
        const mockModel = mock(TestEntity);
        const mockModelInstances = [instance(mockModel), instance(mockModel)];
        const { queryService, mockModelCtor, mockRelationQueryBuilder } = createQueryService();
        // @ts-ignore
        when(mockModelCtor.associations).thenReturn({ [relationName]: { target: TestRelation } });
        mockModelInstances.forEach((mi) => when(mockModelCtor.build(mi)).thenReturn(mi));
        when(mockRelationQueryBuilder.findOptions(query)).thenReturn(findOptions);
        when(mockModel.$get(relationName, findOptions)).thenResolve(entityOneRelations);
        when(mockModel.$get(relationName, findOptions)).thenResolve(entityTwoRelations);
        const queryResult = await queryService.queryRelations(TestRelation, relationName, mockModelInstances, query);
        return expect(queryResult).toEqual(
          new Map([
            [mockModelInstances[0], entityOneRelations],
            [mockModelInstances[1], entityTwoRelations],
          ]),
        );
      });

      it('should return an empty array if no results are found.', async () => {
        const entities = testEntities();
        const entityOneRelations = testRelations(entities[0].testEntityPk);
        const query = {
          paging: { limit: 2 },
        };
        const findOptions: FindOptions = {};
        const mockModel = mock(TestEntity);
        const mockModelInstances = [instance(mockModel), instance(mockModel)];
        const { queryService, mockModelCtor, mockRelationQueryBuilder } = createQueryService();
        // @ts-ignore
        when(mockModelCtor.associations).thenReturn({ [relationName]: { target: TestRelation } });
        mockModelInstances.forEach((mi) => when(mockModelCtor.build(mi)).thenReturn(mi));
        when(mockRelationQueryBuilder.findOptions(query)).thenReturn(findOptions);
        when(mockModel.$get(relationName, findOptions)).thenResolve(entityOneRelations).thenResolve([]);
        const queryResult = await queryService.queryRelations(TestRelation, relationName, mockModelInstances, query);
        return expect(queryResult).toEqual(
          new Map([
            [mockModelInstances[0], entityOneRelations],
            [mockModelInstances[0], []],
          ]),
        );
      });
    });
  });

  describe('#findRelation', () => {
    const relationName = 'oneTestRelation';
    describe('with one entity', () => {
      it('call select and return the result', async () => {
        const entity = testEntities()[0];
        const relation = testRelations(entity.testEntityPk)[0];
        const mockModel = mock(TestEntity);
        const modelInstance = instance(mockModel);
        const { queryService, mockModelCtor } = createQueryService<TestRelation>();
        // @ts-ignore
        when(mockModelCtor.associations).thenReturn({ [relationName]: { target: TestRelation } });
        when(mockModelCtor.build(modelInstance)).thenReturn(modelInstance);
        when(mockModel.$get(relationName)).thenResolve(relation);
        const queryResult = await queryService.findRelation(TestRelation, relationName, modelInstance);
        return expect(queryResult).toEqual(relation);
      });

      it('should return undefined select if no results are found.', async () => {
        const mockModel = mock(TestEntity);
        const modelInstance = instance(mockModel);
        const { queryService, mockModelCtor } = createQueryService<TestRelation>();
        // @ts-ignore
        when(mockModelCtor.associations).thenReturn({ [relationName]: { target: TestRelation } });
        when(mockModelCtor.build(modelInstance)).thenReturn(modelInstance);
        when(mockModel.$get(relationName)).thenResolve(null);
        const queryResult = await queryService.findRelation(TestRelation, relationName, modelInstance);
        return expect(queryResult).toBeUndefined();
      });

      it('throw an error if a relation with that name is not found.', async () => {
        const mockModel = mock(TestEntity);
        const { queryService, mockModelCtor } = createQueryService<TestRelation>();
        // @ts-ignore
        when(mockModelCtor.associations).thenReturn({});
        return expect(queryService.findRelation(TestRelation, relationName, instance(mockModel))).rejects.toThrow(
          `Unable to find relation ${relationName} on `,
        );
      });
    });

    describe('with multiple entities', () => {
      it('call select and return the result', async () => {
        const entities = testEntities();
        const entityOneRelation = testRelations(entities[0].testEntityPk)[0];
        const entityTwoRelation = testRelations(entities[1].testEntityPk)[0];
        const mockModel = mock(TestEntity);
        const mockModelInstances = [instance(mockModel), instance(mockModel)];
        const { queryService, mockModelCtor } = createQueryService();
        // @ts-ignore
        when(mockModelCtor.associations).thenReturn({ [relationName]: { target: TestRelation } });
        mockModelInstances.forEach((mi) => when(mockModelCtor.build(mi)).thenReturn(mi));
        when(mockModel.$get(relationName)).thenResolve(entityOneRelation).thenResolve(entityTwoRelation);
        const queryResult = await queryService.findRelation(TestRelation, relationName, mockModelInstances);
        return expect(queryResult).toEqual(
          new Map([
            [mockModelInstances[0], entityOneRelation],
            [mockModelInstances[1], entityTwoRelation],
          ]),
        );
      });

      it('should return undefined select if no results are found.', async () => {
        const entities = testEntities();
        const entityOneRelation = testRelations(entities[0].testEntityPk)[0];
        const mockModel = mock(TestEntity);
        const mockModelInstances = [instance(mockModel), instance(mockModel)];
        const { queryService, mockModelCtor } = createQueryService();
        // @ts-ignore
        when(mockModelCtor.associations).thenReturn({ [relationName]: { target: TestRelation } });
        mockModelInstances.forEach((mi) => when(mockModelCtor.build(mi)).thenReturn(mi));
        when(mockModel.$get(relationName)).thenResolve(null).thenResolve(entityOneRelation);
        const queryResult = await queryService.findRelation(TestRelation, relationName, mockModelInstances);
        return expect(queryResult).toEqual(new Map([[mockModelInstances[0], entityOneRelation]]));
      });
    });
  });

  describe('#addRelations', () => {
    const relationName = 'testRelations';
    it('call select and return the result', async () => {
      const entity = testEntities()[0];
      const relations = testRelations(entity.testEntityPk);
      const relationIds = relations.map((r) => r.testRelationPk);
      const mockModel = mock(TestEntity);
      const { queryService, mockModelCtor } = createQueryService<TestRelation>();
      const modelInstance = instance(mockModel);
      // this is required to make tests pass see https://github.com/NagRock/ts-mockito/issues/163
      // @ts-ignore
      modelInstance.then = undefined;
      when(mockModelCtor.findByPk(entity.testEntityPk, objectContaining({ rejectOnEmpty: true }))).thenResolve(
        modelInstance,
      );
      when(mockModel.$add(relationName, relationIds)).thenResolve(relations);
      const queryResult = await queryService.addRelations(relationName, entity.testEntityPk, relationIds);
      return expect(queryResult).toEqual(modelInstance);
    });
  });

  describe('#setRelation', () => {
    const relationName = 'oneTestRelation';
    it('call select and return the result', async () => {
      const entity = testEntities()[0];
      const relation = testRelations(entity.testEntityPk)[0];
      const relationId = relation.testRelationPk;
      const mockModel = mock(TestEntity);
      const modelInstance = instance(mockModel);
      const { queryService, mockModelCtor } = createQueryService<TestRelation>();
      // this is required to make tests pass see https://github.com/NagRock/ts-mockito/issues/163
      // @ts-ignore
      modelInstance.then = undefined;
      when(mockModelCtor.findByPk(entity.testEntityPk, objectContaining({ rejectOnEmpty: true }))).thenResolve(
        modelInstance,
      );
      when(mockModel.$set(relationName, relationId)).thenResolve(relation);
      const queryResult = await queryService.setRelation(relationName, entity.testEntityPk, relationId);
      return expect(queryResult).toEqual(modelInstance);
    });
  });

  describe('#removeRelations', () => {
    const relationName = 'testRelations';
    it('call select and return the result', async () => {
      const entity = testEntities()[0];
      const relations = testRelations(entity.testEntityPk);
      const relationIds = relations.map((r) => r.testRelationPk);
      const mockModel = mock(TestEntity);
      const modelInstance = instance(mockModel);
      const { queryService, mockModelCtor } = createQueryService<TestRelation>();
      // this is required to make tests pass see https://github.com/NagRock/ts-mockito/issues/163
      // @ts-ignore
      modelInstance.then = undefined;
      when(mockModelCtor.findByPk(entity.testEntityPk, objectContaining({ rejectOnEmpty: true }))).thenResolve(
        modelInstance,
      );
      when(mockModel.$add(relationName, relationIds)).thenResolve(relations);
      const queryResult = await queryService.removeRelations(relationName, entity.testEntityPk, relationIds);
      return expect(queryResult).toEqual(modelInstance);
    });
  });
  //
  describe('#removeRelation', () => {
    const relationName = 'oneTestRelation';
    it('call select and return the result', async () => {
      const entity = testEntities()[0];
      const relation = testRelations(entity.testEntityPk)[0];
      const relationId = relation.testRelationPk;
      const mockModel = mock(TestEntity);
      const modelInstance = instance(mockModel);
      const { queryService, mockModelCtor } = createQueryService<TestRelation>();
      // this is required to make tests pass see https://github.com/NagRock/ts-mockito/issues/163
      // @ts-ignore
      modelInstance.then = undefined;
      when(mockModelCtor.findByPk(entity.testEntityPk, objectContaining({ rejectOnEmpty: true }))).thenResolve(
        modelInstance,
      );
      when(mockModel.$set(relationName, relationId)).thenResolve(relation);
      const queryResult = await queryService.removeRelation(relationName, entity.testEntityPk, relationId);
      return expect(queryResult).toEqual(modelInstance);
    });
  });

  describe('#findById', () => {
    it('call findOne on the repo', async () => {
      const entity = testEntities()[0];
      const { queryService, mockModelCtor } = createQueryService();
      when(mockModelCtor.findByPk(entity.testEntityPk)).thenResolve(entity);
      const queryResult = await queryService.findById(entity.testEntityPk);
      expect(queryResult).toEqual(entity);
    });

    it('return undefined if not found', async () => {
      const { queryService, mockModelCtor } = createQueryService();
      when(mockModelCtor.findByPk(1)).thenResolve(null);
      const queryResult = await queryService.findById(1);
      expect(queryResult).toBeUndefined();
    });
  });

  describe('#getById', () => {
    it('call findByPk on the model with rejectOnEmpty', async () => {
      const entity = testEntities()[0];
      const { queryService, mockModelCtor } = createQueryService();
      when(mockModelCtor.findByPk(entity.testEntityPk, objectContaining({ rejectOnEmpty: true }))).thenResolve(entity);
      const queryResult = await queryService.getById(entity.testEntityPk);
      expect(queryResult).toEqual(entity);
    });
  });

  describe('#createMany', () => {
    it('call save on the repo with instances of entities when passed plain objects', async () => {
      const entities = testEntities();
      const { queryService, mockModelCtor } = createQueryService();
      when(mockModelCtor.bulkCreate(deepEqual(plainEntities))).thenResolve(entities);
      const queryResult = await queryService.createMany(plainEntities as DeepPartial<TestEntity>[]);
      expect(queryResult).toEqual(entities);
    });
  });

  describe('#createOne', () => {
    it('call save on the repo with an instance of the entity when passed a plain object', async () => {
      const entities = testEntities();
      const { queryService, mockModelCtor } = createQueryService();
      when(mockModelCtor.create(deepEqual(plainEntities[0]))).thenResolve(entities[0]);
      const queryResult = await queryService.createOne(plainEntities[0] as DeepPartial<TestEntity>);
      expect(queryResult).toEqual(entities[0]);
    });
  });

  describe('#deleteMany', () => {
    it('create call destroy with the generated options', async () => {
      const affected = 10;
      const deleteMany: Filter<TestEntity> = { stringType: { eq: 'foo' } };
      const destroyOptions = {};
      const { queryService, mockQueryBuilder, mockModelCtor } = createQueryService();
      when(mockQueryBuilder.destroyOptions(objectContaining({ filter: deleteMany }))).thenReturn(destroyOptions);
      when(mockModelCtor.destroy(destroyOptions)).thenResolve(affected);
      const queryResult = await queryService.deleteMany(deleteMany);
      expect(queryResult).toEqual({ deletedCount: affected });
    });
  });

  describe('#deleteOne', () => {
    it('call getOne and then remove the entity', async () => {
      const entity = testEntities()[0];
      const { testEntityPk } = entity;
      const mockModel = mock(TestEntity);
      const modelInstance = instance(mockModel);
      const { queryService, mockModelCtor } = createQueryService<TestRelation>();
      // this is required to make tests pass see https://github.com/NagRock/ts-mockito/issues/163
      // @ts-ignore
      modelInstance.then = undefined;
      when(mockModelCtor.findByPk(entity.testEntityPk, objectContaining({ rejectOnEmpty: true }))).thenResolve(
        modelInstance,
      );
      when(mockModel.destroy()).thenResolve();
      const queryResult = await queryService.deleteOne(testEntityPk);
      return expect(queryResult).toEqual(modelInstance);
    });

    it('call fail if the entity is not found', async () => {
      const entity = testEntities()[0];
      const { testEntityPk } = entity;
      const err = new Error('not found');
      const mockModel = mock(TestEntity);
      const modelInstance = instance(mockModel);
      const { queryService, mockModelCtor } = createQueryService<TestRelation>();
      // this is required to make tests pass see https://github.com/NagRock/ts-mockito/issues/163
      // @ts-ignore
      modelInstance.then = undefined;
      when(mockModelCtor.findByPk(entity.testEntityPk, objectContaining({ rejectOnEmpty: true }))).thenReject(err);
      return expect(queryService.deleteOne(testEntityPk)).rejects.toThrow(err);
    });
  });

  describe('#updateMany', () => {
    it('create call update with the generated options', async () => {
      const affected = 10;
      const entities = testEntities();
      const updateMany: Filter<TestEntity> = { stringType: { eq: 'foo' } };
      const update = plainEntities[0];
      const updateOptions = { where: {} };
      const { queryService, mockQueryBuilder, mockModelCtor } = createQueryService();
      when(mockQueryBuilder.updateOptions(objectContaining({ filter: updateMany }))).thenReturn(updateOptions);
      when(mockModelCtor.update(update, updateOptions)).thenResolve([affected, entities]);
      const queryResult = await queryService.updateMany(update, updateMany);
      expect(queryResult).toEqual({ updatedCount: affected });
    });
  });

  describe('#updateOne', () => {
    it('call getOne and then remove the entity', async () => {
      const entity = testEntities()[0];
      const { testEntityPk } = entity;
      const update = { stringType: 'baz' };
      const mockModel = mock(TestEntity);
      const modelInstance = instance(mockModel);
      const { queryService, mockModelCtor } = createQueryService<TestRelation>();
      // this is required to make tests pass see https://github.com/NagRock/ts-mockito/issues/163
      // @ts-ignore
      modelInstance.then = undefined;
      when(mockModelCtor.findByPk(entity.testEntityPk, objectContaining({ rejectOnEmpty: true }))).thenResolve(
        modelInstance,
      );
      when(mockModel.update(update)).thenResolve(entity);
      const queryResult = await queryService.updateOne(testEntityPk, update);
      expect(queryResult).toEqual(entity);
    });

    it('call fail if the entity is not found', async () => {
      const entity = testEntities()[0];
      const { testEntityPk } = entity;
      const update = { stringType: 'baz' };
      const err = new Error('not found');
      const mockModel = mock(TestEntity);
      const modelInstance = instance(mockModel);
      const { queryService, mockModelCtor } = createQueryService<TestRelation>();
      // this is required to make tests pass see https://github.com/NagRock/ts-mockito/issues/163
      // @ts-ignore
      modelInstance.then = undefined;
      when(mockModelCtor.findByPk(entity.testEntityPk, objectContaining({ rejectOnEmpty: true }))).thenReject(err);
      return expect(queryService.updateOne(testEntityPk, update)).rejects.toThrow(err);
    });
  });
});
