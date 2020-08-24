import { MongoRepository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { ObjectID } from 'mongodb';
import { TypeOrmMongoQueryService } from '../../src/services';
import { TestEntity } from '../__fixtures__/test.entity';
import {
  closeTestConnection,
  CONNECTION_OPTIONS,
  refresh,
  getTestConnection,
  truncate,
} from '../__fixtures__/connection.fixture';
import { TEST_ENTITIES } from '../__fixtures__/seeds';

describe('TypeOrmMongoQueryService', () => {
  let moduleRef: TestingModule;

  class TestEntityService extends TypeOrmMongoQueryService<TestEntity> {
    constructor(@InjectRepository(TestEntity) readonly repo: MongoRepository<TestEntity>) {
      super(repo);
    }
  }

  afterEach(closeTestConnection);

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(CONNECTION_OPTIONS), TypeOrmModule.forFeature([TestEntity])],
      providers: [TestEntityService],
    }).compile();
    await refresh();
  });

  describe('#query', () => {
    it('call find and return the result', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { eq: 'foo1' } } });
      return expect(queryResult).toEqual([TEST_ENTITIES[0]]);
    });
  });

  describe('#count', () => {
    it('call find and return the result', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.count({ stringType: { gt: 'foo' } });
      return expect(queryResult).toBe(10);
    });
  });

  describe('#findById', () => {
    it('return the entity if found', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.findById(entity.id.toString());
      expect(found).toEqual(entity);
    });

    it('return undefined if not found', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.findById(new ObjectID().toString());
      expect(found).toBeUndefined();
    });
  });

  describe('#getById', () => {
    it('return the entity if found', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.getById(entity.id.toString());
      expect(found).toEqual(entity);
    });

    it('return undefined if not found', () => {
      const badId = new ObjectID().toString();
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.getById(badId)).rejects.toThrow(`Unable to find TestEntity with id: ${badId}`);
    });
  });

  describe('#createMany', () => {
    it('call save on the repo with instances of entities when passed plain objects', async () => {
      await truncate(getTestConnection());
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createMany(TEST_ENTITIES);
      created.forEach((createdEntity, i) => {
        expect(createdEntity).toEqual({
          ...TEST_ENTITIES[i],
          id: expect.any(ObjectID),
        });
      });
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
      expect(created).toEqual({
        ...entity,
        id: expect.any(ObjectID),
      });
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
        stringType: { in: TEST_ENTITIES.slice(0, 5).map((e) => e.stringType) },
      });
      expect(deletedCount).toEqual(expect.any(Number));
      const allCount = await queryService.count({});
      expect(allCount).toBe(5);
    });
  });

  describe('#deleteOne', () => {
    it('remove the entity', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const deleted = await queryService.deleteOne(TEST_ENTITIES[0].id.toString());
      expect(deleted).toEqual({ ...TEST_ENTITIES[0], id: undefined });
    });

    it('call fail if the entity is not found', async () => {
      const badId = new ObjectID().toString();
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.deleteOne(badId)).rejects.toThrow(
        `Could not find any entity of type "TestEntity" matching: "${badId}"`,
      );
    });
  });

  describe('#updateMany', () => {
    it('update all entities in the filter', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const filter = {
        stringType: { in: TEST_ENTITIES.slice(0, 5).map((e) => e.stringType) },
      };
      await queryService.updateMany({ stringType: 'updated' }, filter);
      const entities = await queryService.query({ filter: { stringType: { eq: 'updated' } } });
      expect(entities).toHaveLength(5);
    });

    it('should reject if the update contains the ID', () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.updateMany({ id: new ObjectID() }, {})).rejects.toThrow(
        'Id cannot be specified when updating',
      );
    });
  });

  describe('#updateOne', () => {
    it('update the entity', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const updated = await queryService.updateOne(TEST_ENTITIES[0].id.toString(), { stringType: 'updated' });
      expect(updated).toEqual({ ...TEST_ENTITIES[0], stringType: 'updated' });
    });

    it('should reject if the update contains the ID', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.updateOne(TEST_ENTITIES[0].id.toString(), { id: new ObjectID() })).rejects.toThrow(
        'Id cannot be specified when updating',
      );
    });

    it('call fail if the entity is not found', async () => {
      const badId = new ObjectID().toString();
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.updateOne(badId, { stringType: 'updated' })).rejects.toThrow(
        `Could not find any entity of type "TestEntity" matching: "${badId}"`,
      );
    });
  });
});
