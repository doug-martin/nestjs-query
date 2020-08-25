import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { InjectModel, TypegooseModule } from 'nestjs-typegoose';
import { ReturnModelType, mongoose } from '@typegoose/typegoose';
import { TypegooseQueryService } from '../../src/services';
import { TestEntity } from '../__fixtures__/test.entity';
import { getConnectionUri, prepareDb, closeDbConnection, dropDatabase } from '../__fixtures__/connection.fixture';
import { TEST_ENTITIES, TEST_REFERENCES } from '../__fixtures__/seeds';
import { TestReference } from '../__fixtures__/test-reference.entity';

describe('TypegooseQueryService', () => {
  let moduleRef: TestingModule;

  class TestEntityService extends TypegooseQueryService<TestEntity> {
    constructor(@InjectModel(TestEntity) readonly model: ReturnModelType<typeof TestEntity>) {
      super(model);
    }
  }

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypegooseModule.forRoot(await getConnectionUri(), { useFindAndModify: false }),
        TypegooseModule.forFeature([TestEntity, TestReference]),
      ],
      providers: [TestEntityService],
    }).compile();
  });

  afterAll(async () => closeDbConnection());

  beforeEach(() => prepareDb());

  afterEach(() => dropDatabase());

  describe('#query', () => {
    it('call find and return the result', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { eq: 'foo1' } } });
      return expect(queryResult).toEqual([TEST_ENTITIES[0]]);
    });
  });

  describe('#count', () => {
    it('should return number of elements matching a query', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.count({ stringType: { gt: 'foo' } });
      return expect(queryResult).toBe(15);
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
      const found = await queryService.findById(new mongoose.Types.ObjectId().toString());
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
      const badId = new mongoose.Types.ObjectId().toString();
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.getById(badId)).rejects.toThrow(`Unable to find TestEntity with id: ${badId}`);
    });
  });

  describe('#createMany', () => {
    it('call save on the repo with instances of entities when passed plain objects', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createMany(TEST_ENTITIES.map((e) => e.getInputData()));
      created.forEach((createdEntity, i) => {
        expect(createdEntity).toEqual(expect.objectContaining(TEST_ENTITIES[i].getInputData()));
      });
    });

    it('call save on the repo with instances of entities when passed instances', async () => {
      const instances = TEST_ENTITIES.map((e) => plainToClass(TestEntity, e.getInputData()));
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createMany(instances);
      created.forEach((createdEntity, i) => {
        expect(createdEntity).toEqual(expect.objectContaining(instances[i].getInputData()));
      });
    });

    it('should reject if the entities already exist', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.createMany(TEST_ENTITIES)).rejects.toThrow(/duplicate key error dup key/);
    });
  });

  describe('#createOne', () => {
    it('call save on the repo with an instance of the entity when passed a plain object', async () => {
      const entity = TEST_ENTITIES[0].getInputData();
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createOne(entity);
      expect(created).toEqual(expect.objectContaining(entity));
    });

    it('call save on the repo with an instance of the entity when passed an instance', async () => {
      const entity = plainToClass(TestEntity, TEST_ENTITIES[0].getInputData());
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createOne(entity);
      expect(created).toEqual(expect.objectContaining(entity));
    });

    it('should reject if the entity contains an id', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.createOne({ ...entity })).rejects.toThrow(/duplicate key error dup key/);
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
      expect(allCount).toBe(TEST_ENTITIES.length - 5);
    });
  });

  describe('#deleteOne', () => {
    it('remove the entity', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const deleted = await queryService.deleteOne(TEST_ENTITIES[0].id.toString());
      expect(deleted).toEqual(TEST_ENTITIES[0]);
    });

    it('call fail if the entity is not found', async () => {
      const badId = new mongoose.Types.ObjectId().toString();
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.deleteOne(badId)).rejects.toThrow(`Unable to find TestEntity with id: ${badId}`);
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
      return expect(queryService.updateMany({ id: new mongoose.Types.ObjectId().toString() }, {})).rejects.toThrow(
        'Id cannot be specified when updating',
      );
    });
  });

  describe('#updateOne', () => {
    it('update the entity', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const updated = await queryService.updateOne(TEST_ENTITIES[0].id.toString(), { stringType: 'updated' });
      expect(updated).toEqual({
        ...TEST_ENTITIES[0],
        stringType: 'updated',
      });
    });

    it('should reject if the update contains the ID', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(
        queryService.updateOne(TEST_ENTITIES[0].id.toString(), { id: new mongoose.Types.ObjectId().toString() }),
      ).rejects.toThrow('Id cannot be specified when updating');
    });

    it('call fail if the entity is not found', async () => {
      const badId = new mongoose.Types.ObjectId().toString();
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.updateOne(badId, { stringType: 'updated' })).rejects.toThrow(
        `Unable to find TestEntity with id: ${badId}`,
      );
    });
  });

  describe('#findRelation', () => {
    it('call select and return the result', async () => {
      const entity = TEST_ENTITIES[10];
      entity.testReference = new mongoose.Types.ObjectId(TEST_REFERENCES[0].id);
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.findRelation(TestReference, 'testReference', [entity]);

      expect(queryResult.values().next().value).toEqual(TEST_REFERENCES[0]);
    });

    it('should return undefined select if no results are found.', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.findRelation(TestReference, 'testReference', [entity]);

      expect(queryResult.values().next().value).toBeUndefined();
    });

    it('should return undefined select if relation entity does not exist.', async () => {
      const entity = TEST_ENTITIES[10];
      entity.testReference = new mongoose.Types.ObjectId(TEST_REFERENCES[0].id);
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.findRelation(TestReference, 'badRelation', [entity]);

      expect(queryResult.values().next().value).toBeUndefined();
    });
  });
});
