import { Filter, Query } from '@nestjs-query/core';
import { plainToClass } from 'class-transformer';
import { deepEqual, instance, mock, objectContaining, when } from 'ts-mockito';
import {
  DeleteQueryBuilder,
  RelationQueryBuilder as TypeOrmRelationQueryBuilder,
  Repository,
  SelectQueryBuilder,
  UpdateQueryBuilder,
  EntityManager,
} from 'typeorm';
import { SoftDeleteQueryBuilder } from 'typeorm/query-builder/SoftDeleteQueryBuilder';
import { TypeOrmQueryService, TypeOrmQueryServiceOpts } from '../../src';
import { FilterQueryBuilder, RelationQueryBuilder } from '../../src/query';
import { TestRelation } from '../__fixtures__/test-relation.entity';
import { TestSoftDeleteEntity } from '../__fixtures__/test-soft-delete.entity';
import { TestEntity } from '../__fixtures__/test.entity';

describe('TypeOrmQueryService', (): void => {
  const testEntities = (): TestEntity[] => [
    { testEntityPk: 'entity-id1', stringType: 'foo', boolType: true, dateType: new Date(), numberType: 1 },
    { testEntityPk: 'entity-id2', stringType: 'bar', boolType: false, dateType: new Date(), numberType: 2 },
  ];

  const testRelations = (entityId: string): TestRelation[] => [
    { testRelationPk: `relation-${entityId}-id1`, relationName: 'name 1', testEntityId: entityId },
    { testRelationPk: `relation-${entityId}-id2`, relationName: 'name 2', testEntityId: entityId },
  ];

  const relationName = 'testRelations';

  class TestTypeOrmQueryService<Entity> extends TypeOrmQueryService<Entity> {
    constructor(
      readonly repo: Repository<Entity>,
      readonly relationQueryBuilder?: RelationQueryBuilder<Entity, unknown>,
      opts?: TypeOrmQueryServiceOpts<Entity>,
    ) {
      super(repo, opts);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getRelationQueryBuilder<Relation>(name: string): RelationQueryBuilder<Entity, Relation> {
      return this.relationQueryBuilder as RelationQueryBuilder<Entity, Relation>;
    }
  }

  type MockQueryService<Entity, Relation = unknown> = {
    mockRepo: Repository<Entity>;
    queryService: TypeOrmQueryService<Entity>;
    mockQueryBuilder: FilterQueryBuilder<Entity>;
    mockRelationQueryBuilder: RelationQueryBuilder<Entity, Relation>;
  };

  function createQueryService<Entity = TestEntity, Relation = unknown>(
    opts?: TypeOrmQueryServiceOpts<Entity>,
  ): MockQueryService<Entity, Relation> {
    const mockQueryBuilder = mock<FilterQueryBuilder<Entity>>(FilterQueryBuilder);
    const mockRepo = mock<Repository<Entity>>(Repository);
    const mockRelationQueryBuilder = mock<RelationQueryBuilder<Entity, Relation>>(RelationQueryBuilder);
    const queryService = new TestTypeOrmQueryService(instance(mockRepo), instance(mockRelationQueryBuilder), {
      filterQueryBuilder: instance(mockQueryBuilder),
      ...opts,
    });
    return { mockQueryBuilder, mockRepo, queryService, mockRelationQueryBuilder };
  }

  it('should create a filterQueryBuilder and assemblerService based on the repo passed in if not provided', () => {
    const mockRepo = mock<Repository<TestEntity>>(Repository);
    const repoInstance = instance(mockRepo);
    const queryService = new TestTypeOrmQueryService(repoInstance);
    expect(queryService.filterQueryBuilder).toBeInstanceOf(FilterQueryBuilder);
    expect(queryService.filterQueryBuilder.repo).toEqual(repoInstance);
  });

  describe('#query', () => {
    it('call select and return the result', async () => {
      const entities = testEntities();
      const query: Query<TestEntity> = { filter: { stringType: { eq: 'foo' } } };
      const { queryService, mockQueryBuilder, mockRepo } = createQueryService();
      const selectQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockQueryBuilder.select(query)).thenReturn(instance(selectQueryBuilder));
      when(selectQueryBuilder.getMany()).thenResolve(entities);
      const queryResult = await queryService.query(query);
      return expect(queryResult).toEqual(entities);
    });
  });

  describe('#queryRelations', () => {
    describe('with one entity', () => {
      it('call select and return the result', async () => {
        const entity = testEntities()[0];
        const relations = testRelations(entity.testEntityPk);
        const query: Query<TestRelation> = { filter: { relationName: { eq: 'name' } } };
        const { queryService, mockRepo, mockRelationQueryBuilder } = createQueryService<TestEntity, TestRelation>();
        const selectQueryBuilder: SelectQueryBuilder<TestRelation> = mock(SelectQueryBuilder);
        // @ts-ignore
        when(mockRepo.metadata).thenReturn({ relations: [{ propertyName: relationName, type: TestRelation }] });
        when(mockRepo.target).thenReturn(TestEntity);
        when(mockRelationQueryBuilder.select(objectContaining(entity), query)).thenReturn(instance(selectQueryBuilder));
        when(selectQueryBuilder.getMany()).thenResolve(relations);
        const queryResult = await queryService.queryRelations(TestRelation, relationName, entity, query);
        return expect(queryResult).toEqual(relations);
      });

      it('should look up the type when the relation.type is a string', async () => {
        const entity = testEntities()[0];
        const relations = testRelations(entity.testEntityPk);
        const query: Query<TestRelation> = { filter: { relationName: { eq: 'name' } } };
        const { queryService, mockRepo, mockRelationQueryBuilder } = createQueryService<TestEntity, TestRelation>();
        const selectQueryBuilder: SelectQueryBuilder<TestRelation> = mock(SelectQueryBuilder);
        const mockManger = mock(EntityManager);
        const mockRelationRepo = mock<Repository<TestRelation>>();
        // @ts-ignore
        when(mockRepo.metadata).thenReturn({ relations: [{ propertyName: relationName, type: 'TestRelation' }] });
        when(mockRepo.manager).thenReturn(instance(mockManger));
        when(mockManger.getRepository('TestRelation')).thenReturn(instance(mockRelationRepo));
        when(mockRelationRepo.target).thenReturn(TestRelation);
        when(mockRelationQueryBuilder.select(objectContaining(entity), query)).thenReturn(instance(selectQueryBuilder));
        when(selectQueryBuilder.getMany()).thenResolve(relations);
        const queryResult = await queryService.queryRelations(TestRelation, relationName, entity, query);
        return expect(queryResult).toEqual(relations);
      });
    });

    describe('with multiple entities', () => {
      it('call select and return the result', async () => {
        const entities = testEntities();
        const entityOneRelations = testRelations(entities[0].testEntityPk);
        const entityTwoRelations = testRelations(entities[1].testEntityPk);
        const { queryService, mockRepo, mockRelationQueryBuilder } = createQueryService();
        const relationQueryBuilder: SelectQueryBuilder<TestRelation> = mock(SelectQueryBuilder);
        when(mockRepo.target).thenReturn(TestEntity);
        // @ts-ignore
        when(mockRepo.metadata).thenReturn({ relations: [{ propertyName: relationName, type: TestRelation }] });
        when(mockRelationQueryBuilder.select(entities[0], objectContaining({ paging: { limit: 2 } }))).thenReturn(
          instance(relationQueryBuilder),
        );
        when(mockRelationQueryBuilder.select(entities[1], objectContaining({ paging: { limit: 2 } }))).thenReturn(
          instance(relationQueryBuilder),
        );
        when(relationQueryBuilder.getMany()).thenResolve(entityOneRelations).thenResolve(entityTwoRelations);

        // @ts-ignore
        const queryResult = await queryService.queryRelations(TestRelation, relationName, entities, {
          paging: { limit: 2 },
        });
        return expect(queryResult).toEqual(
          new Map([
            [entities[0], entityOneRelations],
            [entities[1], entityTwoRelations],
          ]),
        );
      });

      it('should return an empty array if no results are found.', async () => {
        const entities = testEntities();
        const entityOneRelations = testRelations(entities[0].testEntityPk);
        const { queryService, mockRepo, mockRelationQueryBuilder } = createQueryService();
        const relationQueryBuilder: SelectQueryBuilder<TestRelation> = mock(SelectQueryBuilder);
        when(mockRepo.target).thenReturn(TestEntity);
        // @ts-ignore
        when(mockRepo.metadata).thenReturn({ relations: [{ propertyName: relationName, type: TestRelation }] });
        when(mockRelationQueryBuilder.select(entities[0], objectContaining({ paging: { limit: 2 } }))).thenReturn(
          instance(relationQueryBuilder),
        );
        when(mockRelationQueryBuilder.select(entities[1], objectContaining({ paging: { limit: 2 } }))).thenReturn(
          instance(relationQueryBuilder),
        );
        when(relationQueryBuilder.getMany()).thenResolve(entityOneRelations).thenResolve([]);
        // @ts-ignore
        const queryResult = await queryService.queryRelations(TestRelation, relationName, entities, {
          paging: { limit: 2 },
        });
        return expect(queryResult).toEqual(
          new Map([
            [entities[0], entityOneRelations],
            [entities[1], []],
          ]),
        );
      });
    });
  });

  describe('#findRelation', () => {
    describe('with one entity', () => {
      it('call select and return the result', async () => {
        const entity = testEntities()[0];
        const relation = testRelations(entity.testEntityPk)[0];
        const { queryService, mockRepo } = createQueryService();
        const entityQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
        const relationQueryBuilder: TypeOrmRelationQueryBuilder<TestEntity> = mock(TypeOrmRelationQueryBuilder);
        when(mockRepo.target).thenReturn(TestEntity);
        when(mockRepo.createQueryBuilder()).thenReturn(instance(entityQueryBuilder));
        when(entityQueryBuilder.relation(relationName)).thenReturn(instance(relationQueryBuilder));
        when(relationQueryBuilder.of(objectContaining(entity))).thenReturn(instance(relationQueryBuilder));
        when(relationQueryBuilder.loadOne<TestRelation>()).thenResolve(relation);
        // @ts-ignore
        when(mockRepo.metadata).thenReturn({ relations: [{ propertyName: relationName, type: TestRelation }] });
        const queryResult = await queryService.findRelation(TestRelation, relationName, entity);
        return expect(queryResult).toEqual(relation);
      });

      it('should return undefined select if no results are found.', async () => {
        const entity = testEntities()[0];
        const { queryService, mockRepo } = createQueryService();
        const entityQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
        const relationQueryBuilder: TypeOrmRelationQueryBuilder<TestEntity> = mock(TypeOrmRelationQueryBuilder);

        when(mockRepo.target).thenReturn(TestEntity);
        when(mockRepo.createQueryBuilder()).thenReturn(instance(entityQueryBuilder));
        when(entityQueryBuilder.relation(relationName)).thenReturn(instance(relationQueryBuilder));
        when(relationQueryBuilder.of(objectContaining(entity))).thenReturn(instance(relationQueryBuilder));
        when(relationQueryBuilder.loadOne<TestRelation>()).thenResolve(undefined);
        // @ts-ignore
        when(mockRepo.metadata).thenReturn({ relations: [{ propertyName: relationName, type: TestRelation }] });
        const queryResult = await queryService.findRelation(TestRelation, relationName, entity);
        return expect(queryResult).toBeUndefined();
      });

      it('throw an error if a relation with that name is not found.', async () => {
        const entity = testEntities()[0];
        const { queryService, mockRepo } = createQueryService();
        const entityQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
        const relationQueryBuilder: TypeOrmRelationQueryBuilder<TestEntity> = mock(TypeOrmRelationQueryBuilder);
        when(mockRepo.target).thenReturn(TestEntity);
        when(mockRepo.createQueryBuilder()).thenReturn(instance(entityQueryBuilder));
        when(entityQueryBuilder.relation(relationName)).thenReturn(instance(relationQueryBuilder));
        when(relationQueryBuilder.of(objectContaining(entity))).thenReturn(instance(relationQueryBuilder));
        when(relationQueryBuilder.loadOne<TestRelation>()).thenResolve(undefined);
        // @ts-ignore
        when(mockRepo.metadata).thenReturn({ relations: [] });
        return expect(queryService.findRelation(TestRelation, relationName, entity)).rejects.toThrow(
          'Unable to find relation testRelations on TestEntity',
        );
      });
    });

    describe('with multiple entities', () => {
      it('call select and return the result', async () => {
        const entities = testEntities();
        const entityOneRelation = testRelations(entities[0].testEntityPk)[0];
        const entityTwoRelation = testRelations(entities[1].testEntityPk)[0];
        const { queryService, mockRepo, mockRelationQueryBuilder } = createQueryService();
        const relationQueryBuilder: SelectQueryBuilder<TestRelation> = mock(SelectQueryBuilder);
        when(mockRepo.target).thenReturn(TestEntity);
        // @ts-ignore
        when(mockRepo.metadata).thenReturn({ relations: [{ propertyName: relationName, type: TestRelation }] });
        when(mockRelationQueryBuilder.select(entities[0], objectContaining({ paging: { limit: 1 } }))).thenReturn(
          instance(relationQueryBuilder),
        );
        when(mockRelationQueryBuilder.select(entities[1], objectContaining({ paging: { limit: 1 } }))).thenReturn(
          instance(relationQueryBuilder),
        );
        when(relationQueryBuilder.getMany()).thenResolve([entityOneRelation]).thenResolve([entityTwoRelation]);
        const queryResult = await queryService.findRelation(TestRelation, relationName, entities);
        return expect(queryResult).toEqual(
          new Map([
            [entities[0], entityOneRelation],
            [entities[1], entityTwoRelation],
          ]),
        );
      });

      it('should return undefined select if no results are found.', async () => {
        const entities = testEntities();
        const entityOneRelation = testRelations(entities[0].testEntityPk)[0];
        const { queryService, mockRepo, mockRelationQueryBuilder } = createQueryService();
        const relationQueryBuilder: SelectQueryBuilder<TestRelation> = mock(SelectQueryBuilder);
        when(mockRepo.target).thenReturn(TestEntity);
        // @ts-ignore
        when(mockRepo.metadata).thenReturn({ relations: [{ propertyName: relationName, type: TestRelation }] });
        when(mockRelationQueryBuilder.select(entities[0], objectContaining({ paging: { limit: 1 } }))).thenReturn(
          instance(relationQueryBuilder),
        );
        when(mockRelationQueryBuilder.select(entities[1], objectContaining({ paging: { limit: 1 } }))).thenReturn(
          instance(relationQueryBuilder),
        );
        when(relationQueryBuilder.getMany()).thenResolve([entityOneRelation]).thenResolve([]);
        const queryResult = await queryService.findRelation(TestRelation, relationName, entities);
        return expect(queryResult).toEqual(
          new Map([
            [entities[0], entityOneRelation],
            [entities[1], undefined],
          ]),
        );
      });
    });
  });

  describe('#addRelations', () => {
    it('call select and return the result', async () => {
      const entity = testEntities()[0];
      const relations = testRelations(entity.testEntityPk);
      const relationIds = relations.map((r) => r.testRelationPk);
      const { queryService, mockRepo } = createQueryService();
      const entityQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
      const relationQueryBuilder: TypeOrmRelationQueryBuilder<TestEntity> = mock(TypeOrmRelationQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.findOneOrFail(entity.testEntityPk)).thenResolve(entity);
      when(mockRepo.createQueryBuilder()).thenReturn(instance(entityQueryBuilder));
      when(entityQueryBuilder.relation(relationName)).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.of(objectContaining(entity))).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.add(relationIds)).thenResolve();
      const queryResult = await queryService.addRelations(relationName, entity.testEntityPk, relationIds);
      return expect(queryResult).toEqual(entity);
    });
  });

  describe('#setRelation', () => {
    it('call select and return the result', async () => {
      const entity = testEntities()[0];
      const relation = testRelations(entity.testEntityPk)[0];
      const { queryService, mockRepo } = createQueryService();
      const entityQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
      const relationQueryBuilder: TypeOrmRelationQueryBuilder<TestEntity> = mock(TypeOrmRelationQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.findOneOrFail(entity.testEntityPk)).thenResolve(entity);
      when(mockRepo.createQueryBuilder()).thenReturn(instance(entityQueryBuilder));
      when(entityQueryBuilder.relation(relationName)).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.of(objectContaining(entity))).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.set(relation.testRelationPk)).thenResolve();
      const queryResult = await queryService.setRelation(relationName, entity.testEntityPk, relation.testRelationPk);
      return expect(queryResult).toEqual(entity);
    });
  });

  describe('#removeRelations', () => {
    it('call select and return the result', async () => {
      const entity = testEntities()[0];
      const relations = testRelations(entity.testEntityPk);
      const relationIds = relations.map((r) => r.testRelationPk);
      const { queryService, mockRepo } = createQueryService();
      const entityQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
      const relationQueryBuilder: TypeOrmRelationQueryBuilder<TestEntity> = mock(TypeOrmRelationQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.findOneOrFail(entity.testEntityPk)).thenResolve(entity);
      when(mockRepo.createQueryBuilder()).thenReturn(instance(entityQueryBuilder));
      when(entityQueryBuilder.relation(relationName)).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.of(objectContaining(entity))).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.remove(relationIds)).thenResolve();
      const queryResult = await queryService.removeRelations(relationName, entity.testEntityPk, relationIds);
      return expect(queryResult).toEqual(entity);
    });
  });

  describe('#removeRelation', () => {
    it('call select and return the result', async () => {
      const entity = testEntities()[0];
      const relation = testRelations(entity.testEntityPk)[0];
      const { queryService, mockRepo } = createQueryService();
      const entityQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
      const relationQueryBuilder: TypeOrmRelationQueryBuilder<TestEntity> = mock(TypeOrmRelationQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.findOneOrFail(entity.testEntityPk)).thenResolve(entity);
      when(mockRepo.createQueryBuilder()).thenReturn(instance(entityQueryBuilder));
      when(entityQueryBuilder.relation(relationName)).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.of(objectContaining(entity))).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.remove(relation.testRelationPk)).thenResolve();
      const queryResult = await queryService.removeRelation(relationName, entity.testEntityPk, relation.testRelationPk);
      return expect(queryResult).toEqual(entity);
    });
  });

  describe('#findById', () => {
    it('call findOne on the repo', async () => {
      const entity = testEntities()[0];
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.findOne(entity.testEntityPk)).thenResolve(entity);
      const queryResult = await queryService.findById(entity.testEntityPk);
      return expect(queryResult).toEqual(entity);
    });

    it('return undefined if not found', async () => {
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.findOne(1)).thenResolve(undefined);
      const queryResult = await queryService.findById(1);
      return expect(queryResult).toBeUndefined();
    });
  });

  describe('#getById', () => {
    it('call findOneOrFail on the repo', async () => {
      const entity = testEntities()[0];
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.findOneOrFail(entity.testEntityPk)).thenResolve(entity);
      const queryResult = await queryService.getById(entity.testEntityPk);
      return expect(queryResult).toEqual(entity);
    });
  });

  describe('#createMany', () => {
    it('call save on the repo with instances of entities when passed plain objects', async () => {
      const entities = testEntities();
      const entityInstances = entities.map((e) => plainToClass(TestEntity, e));
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      entityInstances.forEach((e) => {
        when(mockRepo.hasId(e)).thenReturn(false);
      });
      when(mockRepo.save(entities)).thenResolve(entityInstances);
      const queryResult = await queryService.createMany(entities);
      return expect(queryResult).toEqual(entityInstances);
    });

    it('call save on the repo with instances of entities when passed instances', async () => {
      const entities = testEntities();
      const entityInstances = entities.map((e) => plainToClass(TestEntity, e));
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      entityInstances.forEach((e) => {
        when(mockRepo.hasId(e)).thenReturn(false);
      });
      when(mockRepo.save(deepEqual(entityInstances))).thenResolve(entityInstances);
      const queryResult = await queryService.createMany(entityInstances);
      return expect(queryResult).toEqual(entityInstances);
    });

    it('should reject if the entity contains an id', async () => {
      const entities = testEntities();
      const entityInstances = entities.map((e) => plainToClass(TestEntity, e));
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      entityInstances.forEach((e) => {
        when(mockRepo.hasId(e)).thenReturn(true);
        when(mockRepo.getId(e)).thenReturn(e.testEntityPk);
        when(mockRepo.findOne(e.testEntityPk)).thenResolve(e);
      });
      return expect(queryService.createMany(entityInstances)).rejects.toThrow('Entity already exists');
    });
  });

  describe('#createOne', () => {
    it('call save on the repo with an instance of the entity when passed a plain object', async () => {
      const entity = testEntities()[0];
      const entityInstance = plainToClass(TestEntity, entity);
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.save(deepEqual(entityInstance))).thenResolve(entityInstance);
      const queryResult = await queryService.createOne(entityInstance);
      return expect(queryResult).toEqual(entityInstance);
    });

    it('call save on the repo with an instance of the entity when passed an instance', async () => {
      const entity = testEntities()[0];
      const entityInstance = plainToClass(TestEntity, entity);
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.hasId(entityInstance)).thenReturn(false);
      when(mockRepo.save(entity)).thenResolve(entityInstance);
      const queryResult = await queryService.createOne(entity);
      return expect(queryResult).toEqual(entityInstance);
    });

    it('should reject if the entity contains an id', async () => {
      const entity = testEntities()[0];
      const entityInstance = plainToClass(TestEntity, entity);
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.hasId(entityInstance)).thenReturn(true);
      when(mockRepo.getId(entityInstance)).thenReturn(entityInstance.testEntityPk);
      when(mockRepo.findOne(entityInstance.testEntityPk)).thenResolve(entityInstance);
      return expect(queryService.createOne(entityInstance)).rejects.toThrow('Entity already exists');
    });
  });

  describe('#deleteMany', () => {
    it('create a delete query builder and call execute', async () => {
      const affected = 10;
      const deleteMany: Filter<TestEntity> = { stringType: { eq: 'foo' } };
      const { queryService, mockQueryBuilder, mockRepo } = createQueryService();
      const deleteQueryBuilder: DeleteQueryBuilder<TestEntity> = mock(DeleteQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockQueryBuilder.delete(objectContaining({ filter: deleteMany }))).thenReturn(instance(deleteQueryBuilder));
      when(deleteQueryBuilder.execute()).thenResolve({ raw: undefined, affected });
      const queryResult = await queryService.deleteMany(deleteMany);
      return expect(queryResult).toEqual({ deletedCount: affected });
    });

    it('should return 0 if affected is not returned', async () => {
      const deleteMany: Filter<TestEntity> = { stringType: { eq: 'foo' } };
      const { queryService, mockQueryBuilder, mockRepo } = createQueryService();
      const deleteQueryBuilder: DeleteQueryBuilder<TestEntity> = mock(DeleteQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockQueryBuilder.delete(objectContaining({ filter: deleteMany }))).thenReturn(instance(deleteQueryBuilder));
      when(deleteQueryBuilder.execute()).thenResolve({ raw: undefined });
      const queryResult = await queryService.deleteMany(deleteMany);
      return expect(queryResult).toEqual({ deletedCount: 0 });
    });
  });

  describe('#deleteOne', () => {
    it('call getOne and then remove the entity', async () => {
      const entity = testEntities()[0];
      const { testEntityPk } = entity;
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.findOneOrFail(testEntityPk)).thenResolve(entity);
      when(mockRepo.remove(entity)).thenResolve(entity);
      const queryResult = await queryService.deleteOne(testEntityPk);
      return expect(queryResult).toEqual(entity);
    });

    it('call fail if the entity is not found', async () => {
      const entity = testEntities()[0];
      const { testEntityPk } = entity;
      const err = new Error('not found');
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.findOneOrFail(testEntityPk)).thenReject(err);
      return expect(queryService.deleteOne(testEntityPk)).rejects.toThrow(err);
    });
  });

  describe('#updateMany', () => {
    it('create a query to update all entities', async () => {
      const entity = testEntities()[0];
      const update = { stringType: 'baz' };
      const filter: Filter<TestEntity> = { testEntityPk: { eq: entity.testEntityPk } };
      const affected = 10;
      const { queryService, mockQueryBuilder, mockRepo } = createQueryService();
      const mockUpdateQueryBuilder: UpdateQueryBuilder<TestEntity> = mock(UpdateQueryBuilder);
      const mockUpdateQueryBuilderInstance = instance(mockUpdateQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockQueryBuilder.update(objectContaining({ filter }))).thenReturn(mockUpdateQueryBuilderInstance);
      when(mockUpdateQueryBuilder.set(objectContaining(update))).thenReturn(mockUpdateQueryBuilderInstance);
      when(mockUpdateQueryBuilder.execute()).thenResolve({ generatedMaps: [], raw: undefined, affected });
      when(mockRepo.remove(entity)).thenResolve(entity);
      const queryResult = await queryService.updateMany(update, filter);
      return expect(queryResult).toEqual({ updatedCount: affected });
    });

    it('should reject if the update contains a primary key', async () => {
      const entity = testEntities()[0];
      const update = { stringType: 'baz' };
      const filter: Filter<TestEntity> = { testEntityPk: { eq: entity.testEntityPk } };
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.hasId(update as TestEntity)).thenReturn(true);
      when(mockRepo.remove(entity)).thenResolve(entity);
      return expect(queryService.updateMany(update, filter)).rejects.toThrow('Id cannot be specified when updating');
    });

    it('should return 0 if affected is not defined', async () => {
      const entity = testEntities()[0];
      const update = { stringType: 'baz' };
      const filter: Filter<TestEntity> = { testEntityPk: { eq: entity.testEntityPk } };
      const { queryService, mockQueryBuilder, mockRepo } = createQueryService();
      const mockUpdateQueryBuilder: UpdateQueryBuilder<TestEntity> = mock(UpdateQueryBuilder);
      const mockUpdateQueryBuilderInstance = instance(mockUpdateQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockQueryBuilder.update(objectContaining({ filter }))).thenReturn(mockUpdateQueryBuilderInstance);
      when(mockUpdateQueryBuilder.set(objectContaining(update))).thenReturn(mockUpdateQueryBuilderInstance);
      when(mockUpdateQueryBuilder.execute()).thenResolve({ generatedMaps: [], raw: undefined });
      when(mockRepo.remove(entity)).thenResolve(entity);
      const queryResult = await queryService.updateMany(update, filter);
      return expect(queryResult).toEqual({ updatedCount: 0 });
    });
  });

  describe('#updateOne', () => {
    it('call getOne and then remove the entity', async () => {
      const entity = testEntities()[0];
      const updateId = entity.testEntityPk;
      const update = { stringType: 'baz' };
      const savedEntity = plainToClass(TestEntity, { ...entity, ...update });
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.findOneOrFail(updateId)).thenResolve(entity);
      when(mockRepo.merge(entity, update)).thenReturn(savedEntity);
      when(mockRepo.save(deepEqual(savedEntity))).thenResolve(savedEntity);
      const queryResult = await queryService.updateOne(updateId, update);
      return expect(queryResult).toEqual(savedEntity);
    });

    it('should reject if the update contains a primary key', async () => {
      const entity = testEntities()[0];
      const updateId = entity.testEntityPk;
      const update = { stringType: 'baz' };
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.hasId(update as TestEntity)).thenReturn(true);
      when(mockRepo.remove(entity)).thenResolve(entity);
      return expect(queryService.updateOne(updateId, update)).rejects.toThrow('Id cannot be specified when updating');
    });

    it('call fail if the entity is not found', async () => {
      const entity = testEntities()[0];
      const updateId = entity.testEntityPk;
      const update = { stringType: 'baz' };
      const err = new Error('not found');
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.findOneOrFail(updateId)).thenReject(err);
      return expect(queryService.updateOne(updateId, update)).rejects.toThrow(err);
    });
  });

  describe('#isSoftDelete', () => {
    describe('#deleteMany', () => {
      it('create a delete query builder and call execute', async () => {
        const affected = 10;
        const deleteMany: Filter<TestSoftDeleteEntity> = { stringType: { eq: 'foo' } };
        const { queryService, mockQueryBuilder, mockRepo } = createQueryService<TestSoftDeleteEntity>({
          useSoftDelete: true,
        });
        const deleteQueryBuilder: SoftDeleteQueryBuilder<TestSoftDeleteEntity> = mock(SoftDeleteQueryBuilder);
        when(mockRepo.target).thenReturn(TestSoftDeleteEntity);
        when(mockQueryBuilder.softDelete(objectContaining({ filter: deleteMany }))).thenReturn(
          instance(deleteQueryBuilder),
        );
        when(deleteQueryBuilder.execute()).thenResolve({ raw: undefined, affected, generatedMaps: [] });
        const queryResult = await queryService.deleteMany(deleteMany);
        return expect(queryResult).toEqual({ deletedCount: affected });
      });

      it('should return 0 if affected is not returned', async () => {
        const deleteMany: Filter<TestSoftDeleteEntity> = { stringType: { eq: 'foo' } };
        const { queryService, mockQueryBuilder, mockRepo } = createQueryService<TestSoftDeleteEntity>({
          useSoftDelete: true,
        });
        const deleteQueryBuilder: SoftDeleteQueryBuilder<TestSoftDeleteEntity> = mock(SoftDeleteQueryBuilder);
        when(mockRepo.target).thenReturn(TestSoftDeleteEntity);
        when(mockQueryBuilder.softDelete(objectContaining({ filter: deleteMany }))).thenReturn(
          instance(deleteQueryBuilder),
        );
        when(deleteQueryBuilder.execute()).thenResolve({ raw: undefined, generatedMaps: [] });
        const queryResult = await queryService.deleteMany(deleteMany);
        return expect(queryResult).toEqual({ deletedCount: 0 });
      });
    });

    describe('#deleteOne', () => {
      it('call getOne and then remove the entity', async () => {
        const entity = testEntities()[0];
        const { testEntityPk } = entity;
        const { queryService, mockRepo } = createQueryService<TestSoftDeleteEntity>({ useSoftDelete: true });
        when(mockRepo.target).thenReturn(TestSoftDeleteEntity);
        when(mockRepo.findOneOrFail(testEntityPk)).thenResolve(entity);
        when(mockRepo.softRemove(entity)).thenResolve(entity);
        const queryResult = await queryService.deleteOne(testEntityPk);
        return expect(queryResult).toEqual(entity);
      });

      it('call fail if the entity is not found', async () => {
        const entity = testEntities()[0];
        const { testEntityPk } = entity;
        const err = new Error('not found');
        const { queryService, mockRepo } = createQueryService({ useSoftDelete: true });
        when(mockRepo.findOneOrFail(testEntityPk)).thenReject(err);
        return expect(queryService.deleteOne(testEntityPk)).rejects.toThrow(err);
      });
    });

    describe('#restoreOne', () => {
      it('restore the entity', async () => {
        const entity = testEntities()[0];
        const { testEntityPk } = entity;
        const { queryService, mockRepo } = createQueryService<TestSoftDeleteEntity>({ useSoftDelete: true });
        when(mockRepo.target).thenReturn(TestSoftDeleteEntity);
        when(mockRepo.restore(entity.testEntityPk)).thenResolve({ generatedMaps: [], raw: undefined, affected: 1 });
        when(mockRepo.findOneOrFail(testEntityPk)).thenResolve(entity);
        const queryResult = await queryService.restoreOne(testEntityPk);
        return expect(queryResult).toEqual(entity);
      });

      it('should fail if the entity is not found', async () => {
        const entity = testEntities()[0];
        const { testEntityPk } = entity;
        const err = new Error('not found');
        const { queryService, mockRepo } = createQueryService({ useSoftDelete: true });
        when(mockRepo.restore(entity.testEntityPk)).thenResolve({ generatedMaps: [], raw: undefined, affected: 1 });
        when(mockRepo.findOneOrFail(testEntityPk)).thenReject(err);
        return expect(queryService.restoreOne(testEntityPk)).rejects.toThrow(err);
      });

      it('should fail if the useSoftDelete is not enabled', async () => {
        const entity = testEntities()[0];
        const { testEntityPk } = entity;
        const { queryService, mockRepo } = createQueryService();
        when(mockRepo.target).thenReturn(TestSoftDeleteEntity);
        return expect(queryService.restoreOne(testEntityPk)).rejects.toThrow(
          'Restore not allowed for non soft deleted entity TestSoftDeleteEntity.',
        );
      });
    });

    describe('#restoreMany', () => {
      it('should restore multiple entities', async () => {
        const affected = 10;
        const deleteMany: Filter<TestSoftDeleteEntity> = { stringType: { eq: 'foo' } };
        const { queryService, mockQueryBuilder, mockRepo } = createQueryService<TestSoftDeleteEntity>({
          useSoftDelete: true,
        });
        const deleteQueryBuilder: SoftDeleteQueryBuilder<TestSoftDeleteEntity> = mock(SoftDeleteQueryBuilder);
        when(mockRepo.target).thenReturn(TestSoftDeleteEntity);
        when(mockQueryBuilder.softDelete(objectContaining({ filter: deleteMany }))).thenReturn(
          instance(deleteQueryBuilder),
        );
        when(deleteQueryBuilder.restore()).thenReturn(instance(deleteQueryBuilder));
        when(deleteQueryBuilder.execute()).thenResolve({ raw: undefined, affected, generatedMaps: [] });
        const queryResult = await queryService.restoreMany(deleteMany);
        return expect(queryResult).toEqual({ updatedCount: affected });
      });

      it('should return 0 if affected is not returned', async () => {
        const deleteMany: Filter<TestSoftDeleteEntity> = { stringType: { eq: 'foo' } };
        const { queryService, mockQueryBuilder, mockRepo } = createQueryService<TestSoftDeleteEntity>({
          useSoftDelete: true,
        });
        const deleteQueryBuilder: SoftDeleteQueryBuilder<TestSoftDeleteEntity> = mock(SoftDeleteQueryBuilder);
        when(mockRepo.target).thenReturn(TestSoftDeleteEntity);
        when(mockQueryBuilder.softDelete(objectContaining({ filter: deleteMany }))).thenReturn(
          instance(deleteQueryBuilder),
        );
        when(deleteQueryBuilder.restore()).thenReturn(instance(deleteQueryBuilder));
        when(deleteQueryBuilder.execute()).thenResolve({ raw: undefined, generatedMaps: [] });
        const queryResult = await queryService.restoreMany(deleteMany);
        return expect(queryResult).toEqual({ updatedCount: 0 });
      });

      it('should fail if the useSoftDelete is not enabled', async () => {
        const { queryService, mockRepo } = createQueryService();
        when(mockRepo.target).thenReturn(TestSoftDeleteEntity);
        return expect(queryService.restoreMany({ stringType: { eq: 'foo' } })).rejects.toThrow(
          'Restore not allowed for non soft deleted entity TestSoftDeleteEntity.',
        );
      });
    });
  });
});
