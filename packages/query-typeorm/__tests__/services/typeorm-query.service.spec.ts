import { DefaultAssembler, AssemblerService, Filter, Query, QueryService } from '@nestjs-query/core';

import { plainToClass } from 'class-transformer';
import { deepEqual, instance, mock, objectContaining, when } from 'ts-mockito';
import { DeleteQueryBuilder, RelationQueryBuilder, Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { TypeOrmQueryService } from '../../src';
import { FilterQueryBuilder } from '../../src/query';
import { TestRelation } from '../__fixtures__/test-relation.entity';
import { TestEntity } from '../__fixtures__/test.entity';

describe('TypeOrmQueryService', (): void => {
  const testEntities = (): TestEntity[] => [
    { id: 'entity-id1', stringType: 'foo', boolType: true, dateType: new Date(), numberType: 1 },
    { id: 'entity-id2', stringType: 'bar', boolType: false, dateType: new Date(), numberType: 2 },
  ];

  const testRelations = (entityId: string): TestRelation[] => [
    { id: 'relation-id1', relationName: 'name 1', testEntityId: entityId },
    { id: 'relation-id2', relationName: 'name 2', testEntityId: entityId },
  ];

  const relationName = 'testRelations';
  const defaultAssembler = new DefaultAssembler(TestEntity, TestEntity);
  const defaultRelationAssembler = new DefaultAssembler(TestRelation, TestRelation);

  @QueryService(TestEntity)
  class TestTypeOrmQueryService extends TypeOrmQueryService<TestEntity> {
    constructor(
      readonly repo: Repository<TestEntity>,
      assemblerService?: AssemblerService,
      filterQueryBuilder?: FilterQueryBuilder<TestEntity>,
    ) {
      super(repo, assemblerService, filterQueryBuilder);
    }
  }

  type MockQueryService = {
    mockRepo: Repository<TestEntity>;
    queryService: QueryService<TestEntity>;
    mockQueryBuilder: FilterQueryBuilder<TestEntity>;
    mockAssembler: AssemblerService;
  };

  function createQueryService(): MockQueryService {
    const mockQueryBuilder = mock<FilterQueryBuilder<TestEntity>>(FilterQueryBuilder);
    const mockRepo = mock<Repository<TestEntity>>(Repository);
    const mockAssembler = mock(AssemblerService);
    const queryService = new TestTypeOrmQueryService(
      instance(mockRepo),
      instance(mockAssembler),
      instance(mockQueryBuilder),
    );
    return { mockQueryBuilder, mockRepo, mockAssembler, queryService };
  }

  it('should throw an error if the DTO class cannot be discovered', () => {
    class TestNoDecoratorTypeOrmQueryService extends TypeOrmQueryService<TestEntity, TestEntity> {
      constructor(
        readonly repo: Repository<TestEntity>,
        assemblerService?: AssemblerService,
        filterQueryBuilder?: FilterQueryBuilder<TestEntity>,
      ) {
        super(repo, assemblerService, filterQueryBuilder);
      }
    }
    const mockRepo = mock<Repository<TestEntity>>(Repository);
    expect(() => new TestNoDecoratorTypeOrmQueryService(instance(mockRepo))).toThrowError(
      'Unable to determine DTO type for TestNoDecoratorTypeOrmQueryService. Did you annotate your service with @QueryService?',
    );
  });

  it('should create a filterQueryBuilder and assemblerService based on the repo passed in if not provided', () => {
    const mockRepo = mock<Repository<TestEntity>>(Repository);
    const repoInstance = instance(mockRepo);
    const queryService = new TestTypeOrmQueryService(repoInstance);
    expect(queryService.filterQueryBuilder).toBeInstanceOf(FilterQueryBuilder);
    expect(queryService.filterQueryBuilder.repo).toEqual(repoInstance);
    expect(queryService.assemblerService).toBeInstanceOf(AssemblerService);
  });

  describe('#query', () => {
    it('call select and return the result', async () => {
      const entities = testEntities();
      const query: Query<TestEntity> = { filter: { stringType: { eq: 'foo' } } };
      const { queryService, mockQueryBuilder, mockAssembler, mockRepo } = createQueryService();
      const selectQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockQueryBuilder.select(query)).thenReturn(instance(selectQueryBuilder));
      when(selectQueryBuilder.getMany()).thenResolve(entities);
      const queryResult = await queryService.query(query);
      expect(queryResult).toEqual(entities);
    });
  });

  describe('#queryRelations', () => {
    it('call select and return the result', async () => {
      const entity = testEntities()[0];
      const relations = testRelations(entity.id);
      const query: Query<TestRelation> = { filter: { relationName: { eq: 'name' } } };
      const { queryService, mockQueryBuilder, mockAssembler, mockRepo } = createQueryService();
      const selectQueryBuilder: SelectQueryBuilder<TestRelation> = mock(SelectQueryBuilder);
      // @ts-ignore
      when(mockRepo.metadata).thenReturn({ relations: [{ propertyName: relationName, type: TestRelation }] });
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockQueryBuilder.selectRelation(objectContaining(entity), relationName, query)).thenReturn(
        instance(selectQueryBuilder),
      );
      when(selectQueryBuilder.getMany()).thenResolve(relations);
      when(mockAssembler.getAssembler(TestRelation, TestRelation)).thenReturn(defaultRelationAssembler);
      const queryResult = await queryService.queryRelations(TestRelation, relationName, entity, query);
      expect(queryResult).toEqual(relations);
    });
  });

  describe('#findRelation', () => {
    it('call select and return the result', async () => {
      const entity = testEntities()[0];
      const relation = testRelations(entity.id)[0];
      const { queryService, mockRepo, mockAssembler } = createQueryService();
      const entityQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
      const relationQueryBuilder: RelationQueryBuilder<TestEntity> = mock(RelationQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      when(mockRepo.createQueryBuilder()).thenReturn(instance(entityQueryBuilder));
      when(entityQueryBuilder.relation(relationName)).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.of(objectContaining(entity))).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.loadOne<TestRelation>()).thenResolve(relation);
      when(mockAssembler.getAssembler(TestRelation, TestRelation)).thenReturn(defaultRelationAssembler);
      // @ts-ignore
      when(mockRepo.metadata).thenReturn({ relations: [{ propertyName: relationName, type: TestRelation }] });
      const queryResult = await queryService.findRelation(TestRelation, relationName, entity);
      expect(queryResult).toEqual(relation);
    });

    it('should return undefined select if no results are found.', async () => {
      const entity = testEntities()[0];
      const { queryService, mockRepo, mockAssembler } = createQueryService();
      const entityQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
      const relationQueryBuilder: RelationQueryBuilder<TestEntity> = mock(RelationQueryBuilder);

      when(mockRepo.target).thenReturn(TestEntity);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      when(mockRepo.createQueryBuilder()).thenReturn(instance(entityQueryBuilder));
      when(entityQueryBuilder.relation(relationName)).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.of(objectContaining(entity))).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.loadOne<TestRelation>()).thenResolve(undefined);
      // @ts-ignore
      when(mockRepo.metadata).thenReturn({ relations: [{ propertyName: relationName, type: TestRelation }] });
      const queryResult = await queryService.findRelation(TestRelation, relationName, entity);
      expect(queryResult).toBeUndefined();
    });

    it('throw an error if a relation with that name is not found.', async () => {
      const entity = testEntities()[0];
      const { queryService, mockRepo } = createQueryService();
      const entityQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
      const relationQueryBuilder: RelationQueryBuilder<TestEntity> = mock(RelationQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.createQueryBuilder()).thenReturn(instance(entityQueryBuilder));
      when(entityQueryBuilder.relation(relationName)).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.of(objectContaining(entity))).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.loadOne<TestRelation>()).thenResolve(undefined);
      // @ts-ignore
      when(mockRepo.metadata).thenReturn({ relations: [] });
      expect(queryService.findRelation(TestRelation, relationName, entity)).rejects.toThrowError(
        'Unable to find relation testRelations on TestEntity',
      );
    });
  });

  describe('#addRelations', () => {
    it('call select and return the result', async () => {
      const entity = testEntities()[0];
      const relations = testRelations(entity.id);
      const relationIds = relations.map(r => r.id);
      const { queryService, mockRepo, mockAssembler } = createQueryService();
      const entityQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
      const relationQueryBuilder: RelationQueryBuilder<TestEntity> = mock(RelationQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      when(mockRepo.findOneOrFail(entity.id)).thenResolve(entity);
      when(mockRepo.createQueryBuilder()).thenReturn(instance(entityQueryBuilder));
      when(entityQueryBuilder.relation(relationName)).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.of(objectContaining(entity))).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.add(relationIds)).thenResolve();
      const queryResult = await queryService.addRelations(relationName, entity.id, relationIds);
      expect(queryResult).toEqual(entity);
    });
  });

  describe('#setRelation', () => {
    it('call select and return the result', async () => {
      const entity = testEntities()[0];
      const relation = testRelations(entity.id)[0];
      const { queryService, mockRepo, mockAssembler } = createQueryService();
      const entityQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
      const relationQueryBuilder: RelationQueryBuilder<TestEntity> = mock(RelationQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      when(mockRepo.findOneOrFail(entity.id)).thenResolve(entity);
      when(mockRepo.createQueryBuilder()).thenReturn(instance(entityQueryBuilder));
      when(entityQueryBuilder.relation(relationName)).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.of(objectContaining(entity))).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.set(relation.id)).thenResolve();
      const queryResult = await queryService.setRelation(relationName, entity.id, relation.id);
      expect(queryResult).toEqual(entity);
    });
  });

  describe('#removeRelations', () => {
    it('call select and return the result', async () => {
      const entity = testEntities()[0];
      const relations = testRelations(entity.id);
      const relationIds = relations.map(r => r.id);
      const { queryService, mockRepo, mockAssembler } = createQueryService();
      const entityQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
      const relationQueryBuilder: RelationQueryBuilder<TestEntity> = mock(RelationQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      when(mockRepo.findOneOrFail(entity.id)).thenResolve(entity);
      when(mockRepo.createQueryBuilder()).thenReturn(instance(entityQueryBuilder));
      when(entityQueryBuilder.relation(relationName)).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.of(objectContaining(entity))).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.remove(relationIds)).thenResolve();
      const queryResult = await queryService.removeRelations(entity.id, relationName, relationIds);
      expect(queryResult).toEqual(entity);
    });
  });

  describe('#removeRelation', () => {
    it('call select and return the result', async () => {
      const entity = testEntities()[0];
      const relation = testRelations(entity.id)[0];
      const { queryService, mockRepo, mockAssembler } = createQueryService();
      const entityQueryBuilder: SelectQueryBuilder<TestEntity> = mock(SelectQueryBuilder);
      const relationQueryBuilder: RelationQueryBuilder<TestEntity> = mock(RelationQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      when(mockRepo.findOneOrFail(entity.id)).thenResolve(entity);
      when(mockRepo.createQueryBuilder()).thenReturn(instance(entityQueryBuilder));
      when(entityQueryBuilder.relation(relationName)).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.of(objectContaining(entity))).thenReturn(instance(relationQueryBuilder));
      when(relationQueryBuilder.remove(relation.id)).thenResolve();
      const queryResult = await queryService.removeRelation(entity.id, relationName, relation.id);
      expect(queryResult).toEqual(entity);
    });
  });

  describe('#findById', () => {
    it('call findOne on the repo', async () => {
      const entity = testEntities()[0];
      const { queryService, mockRepo, mockAssembler } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      when(mockRepo.findOne(entity.id)).thenResolve(entity);
      const queryResult = await queryService.findById(entity.id);
      expect(queryResult).toEqual(entity);
    });

    it('return undefined if not found', async () => {
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.findOne(1)).thenResolve(undefined);
      const queryResult = await queryService.findById(1);
      expect(queryResult).toBeUndefined();
    });
  });

  describe('#getById', () => {
    it('call findOneOrFail on the repo', async () => {
      const entity = testEntities()[0];
      const { queryService, mockRepo, mockAssembler } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.findOneOrFail(entity.id)).thenResolve(entity);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      const queryResult = await queryService.getById(entity.id);
      expect(queryResult).toEqual(entity);
    });
  });

  describe('#createMany', () => {
    it('call save on the repo with instances of entities when passed plain objects', async () => {
      const entities = testEntities();
      const entityInstances = entities.map(e => plainToClass(TestEntity, e));
      const { queryService, mockRepo, mockAssembler } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.save(deepEqual(entityInstances))).thenResolve(entityInstances);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      const queryResult = await queryService.createMany(entities);
      expect(queryResult).toEqual(entityInstances);
    });

    it('call save on the repo with instances of entities when passed instances', async () => {
      const entities = testEntities();
      const entityInstances = entities.map(e => plainToClass(TestEntity, e));
      const { queryService, mockRepo, mockAssembler } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.save(deepEqual(entityInstances))).thenResolve(entityInstances);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      const queryResult = await queryService.createMany(entityInstances);
      expect(queryResult).toEqual(entityInstances);
    });
  });

  describe('#createOne', () => {
    it('call save on the repo with an instance of the entity when passed a plain object', async () => {
      const entity = testEntities()[0];
      const entityInstance = plainToClass(TestEntity, entity);
      const { queryService, mockRepo, mockAssembler } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.save(deepEqual(entityInstance))).thenResolve(entityInstance);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      const queryResult = await queryService.createOne(entityInstance);
      expect(queryResult).toEqual(entityInstance);
    });

    it('call save on the repo with an instance of the entity when passed an instance', async () => {
      const entity = testEntities()[0];
      const entityInstance = plainToClass(TestEntity, entity);
      const { queryService, mockRepo, mockAssembler } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.save(deepEqual(entityInstance))).thenResolve(entityInstance);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      const queryResult = await queryService.createOne(entity);
      expect(queryResult).toEqual(entityInstance);
    });
  });

  describe('#deleteMany', () => {
    it('create a delete query builder and call execute', async () => {
      const affected = 10;
      const deleteMany: Filter<TestEntity> = { stringType: { eq: 'foo' } };
      const { queryService, mockQueryBuilder, mockRepo, mockAssembler } = createQueryService();
      const deleteQueryBuilder: DeleteQueryBuilder<TestEntity> = mock(DeleteQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockQueryBuilder.delete(objectContaining({ filter: deleteMany }))).thenReturn(instance(deleteQueryBuilder));
      when(deleteQueryBuilder.execute()).thenResolve({ raw: undefined, affected });
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      const queryResult = await queryService.deleteMany(deleteMany);
      expect(queryResult).toEqual({ deletedCount: affected });
    });

    it('should return 0 if affected is not returned', async () => {
      const deleteMany: Filter<TestEntity> = { stringType: { eq: 'foo' } };
      const { queryService, mockQueryBuilder, mockRepo, mockAssembler } = createQueryService();
      const deleteQueryBuilder: DeleteQueryBuilder<TestEntity> = mock(DeleteQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      when(mockQueryBuilder.delete(objectContaining({ filter: deleteMany }))).thenReturn(instance(deleteQueryBuilder));
      when(deleteQueryBuilder.execute()).thenResolve({ raw: undefined });
      const queryResult = await queryService.deleteMany(deleteMany);
      expect(queryResult).toEqual({ deletedCount: 0 });
    });
  });

  describe('#deleteOne', () => {
    it('call getOne and then remove the entity', async () => {
      const entity = testEntities()[0];
      const { id } = entity;
      const { queryService, mockRepo, mockAssembler } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockRepo.findOneOrFail(id)).thenResolve(entity);
      when(mockRepo.remove(entity)).thenResolve(entity);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      const queryResult = await queryService.deleteOne(id);
      expect(queryResult).toEqual(entity);
    });

    it('call fail if the entity is not found', async () => {
      const entity = testEntities()[0];
      const { id } = entity;
      const err = new Error('not found');
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.findOneOrFail(id)).thenReject(err);
      return expect(queryService.deleteOne(id)).rejects.toThrowError(err);
    });
  });

  describe('#updateMany', () => {
    it('create a query to update all entities', async () => {
      const entity = testEntities()[0];
      const update = { stringType: 'baz' };
      const filter: Filter<TestEntity> = { id: { eq: entity.id } };
      const affected = 10;
      const { queryService, mockQueryBuilder, mockRepo, mockAssembler } = createQueryService();
      const mockUpdateQueryBuilder: UpdateQueryBuilder<TestEntity> = mock(UpdateQueryBuilder);
      const mockUpdateQueryBuilderInstance = instance(mockUpdateQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      when(mockQueryBuilder.update(objectContaining({ filter }))).thenReturn(mockUpdateQueryBuilderInstance);
      when(mockUpdateQueryBuilder.set(objectContaining(update))).thenReturn(mockUpdateQueryBuilderInstance);
      when(mockUpdateQueryBuilder.execute()).thenResolve({ generatedMaps: [], raw: undefined, affected });
      when(mockRepo.remove(entity)).thenResolve(entity);
      const queryResult = await queryService.updateMany(update, filter);
      expect(queryResult).toEqual({ updatedCount: affected });
    });

    it('should return 0 if affected is not defined', async () => {
      const entity = testEntities()[0];
      const update = { stringType: 'baz' };
      const filter: Filter<TestEntity> = { id: { eq: entity.id } };
      const { queryService, mockQueryBuilder, mockRepo, mockAssembler } = createQueryService();
      const mockUpdateQueryBuilder: UpdateQueryBuilder<TestEntity> = mock(UpdateQueryBuilder);
      const mockUpdateQueryBuilderInstance = instance(mockUpdateQueryBuilder);
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      when(mockQueryBuilder.update(objectContaining({ filter }))).thenReturn(mockUpdateQueryBuilderInstance);
      when(mockUpdateQueryBuilder.set(objectContaining(update))).thenReturn(mockUpdateQueryBuilderInstance);
      when(mockUpdateQueryBuilder.execute()).thenResolve({ generatedMaps: [], raw: undefined });
      when(mockRepo.remove(entity)).thenResolve(entity);
      const queryResult = await queryService.updateMany(update, filter);
      expect(queryResult).toEqual({ updatedCount: 0 });
    });
  });

  describe('#updateOne', () => {
    it('call getOne and then remove the entity', async () => {
      const entity = testEntities()[0];
      const updateId = entity.id;
      const update = { stringType: 'baz' };
      const savedEntity = plainToClass(TestEntity, { ...entity, ...update });
      const { queryService, mockRepo, mockAssembler } = createQueryService();
      when(mockRepo.target).thenReturn(TestEntity);
      when(mockAssembler.getAssembler(TestEntity, TestEntity)).thenReturn(defaultAssembler);
      when(mockRepo.findOneOrFail(updateId)).thenResolve(entity);
      when(mockRepo.merge(entity, update)).thenReturn(savedEntity);
      when(mockRepo.save(deepEqual(savedEntity))).thenResolve(savedEntity);
      const queryResult = await queryService.updateOne(updateId, update);
      expect(queryResult).toEqual(savedEntity);
    });

    it('call fail if the entity is not found', async () => {
      const entity = testEntities()[0];
      const updateId = entity.id;
      const update = { stringType: 'baz' };
      const err = new Error('not found');
      const { queryService, mockRepo } = createQueryService();
      when(mockRepo.findOneOrFail(updateId)).thenReject(err);
      return expect(queryService.updateOne(updateId, update)).rejects.toThrowError(err);
    });
  });
});
