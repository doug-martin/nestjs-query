import { getModelForClass } from '@typegoose/typegoose';
/* eslint-disable no-underscore-dangle,@typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { TypegooseQueryService } from '../../src/services';
import { ObjectId } from 'mongodb';
import {
  TestReference,
  TestEntity,
  TEST_ENTITIES,
  getConnectionUri,
  prepareDb,
  closeDbConnection,
  dropDatabase,
  TEST_REFERENCES,
} from '../__fixtures__';
import { NestjsQueryTypegooseModule } from '../../src';
import { ReturnModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel, TypegooseModule } from 'nestjs-typegoose';
import { DocumentType } from '@typegoose/typegoose';

describe('TypegooseQueryService', () => {
  let moduleRef: TestingModule;
  let TestEntityModel: ReturnModelType<typeof TestEntity>;
  let TestReferenceModel: ReturnModelType<typeof TestReference>;

  class TestEntityService extends TypegooseQueryService<TestEntity> {
    constructor(@InjectModel(TestEntity) readonly model: ReturnModelType<typeof TestEntity>) {
      super(model);
      TestEntityModel = model;
    }
  }

  class TestReferenceService extends TypegooseQueryService<TestReference> {
    constructor(@InjectModel(TestReference) readonly model: ReturnModelType<typeof TestReference>) {
      super(model);
    }
  }

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypegooseModule.forRoot(await getConnectionUri(), {
          useFindAndModify: false,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        NestjsQueryTypegooseModule.forFeature([TestEntity, TestReference]),
      ],
      providers: [TestReferenceService, TestEntityService],
    }).compile();
  });

  function testEntityToObject(te: TestEntity): Partial<TestEntity> {
    return {
      _id: te._id,
      stringType: te.stringType,
      boolType: te.boolType,
      numberType: te.numberType,
      dateType: te.dateType,
    };
  }

  function testEntityToCreate(te: TestEntity): Partial<TestEntity> {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, ...insert } = testEntityToObject(te);
    return insert;
  }

  function expectEqualCreate(result: TestEntity[], expected: TestEntity[]) {
    const cleansedResults = result.map(testEntityToCreate);
    const cleansedExpected = expected.map(testEntityToCreate);
    expect(cleansedResults).toEqual(cleansedExpected);
  }

  afterAll(async () => closeDbConnection());

  beforeEach(() => prepareDb());

  afterEach(() => dropDatabase());

  describe('#query', () => {
    it('call find and return the result', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({});

      expect(queryResult).toEqual(expect.arrayContaining(TEST_ENTITIES));
    });

    it('should support eq operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { eq: 'foo1' } } });
      expect(queryResult).toEqual([TEST_ENTITIES[0]]);
    });

    it('should support neq operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { neq: 'foo1' } } });
      expect(queryResult).toEqual(expect.arrayContaining(TEST_ENTITIES.slice(1)));
    });

    it('should support gt operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { numberType: { gt: 5 } } });
      expect(queryResult).toEqual(expect.arrayContaining(TEST_ENTITIES.slice(5)));
    });

    it('should support gte operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { numberType: { gte: 5 } } });
      expect(queryResult).toEqual(expect.arrayContaining(TEST_ENTITIES.slice(4)));
    });

    it('should support lt operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { numberType: { lt: 5 } } });
      expect(queryResult).toEqual(expect.arrayContaining(TEST_ENTITIES.slice(0, 4)));
    });

    it('should support lte operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { numberType: { lte: 5 } } });
      expect(queryResult).toEqual(expect.arrayContaining(TEST_ENTITIES.slice(0, 5)));
    });

    it('should support in operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { numberType: { in: [1, 2, 3] } } });
      expect(queryResult).toEqual(expect.arrayContaining(TEST_ENTITIES.slice(0, 3)));
    });

    it('should support notIn operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { numberType: { notIn: [1, 2, 3] } } });
      expect(queryResult).toEqual(expect.arrayContaining(TEST_ENTITIES.slice(4)));
    });

    it('should support is operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { boolType: { is: true } } });
      expect(queryResult).toEqual(expect.arrayContaining(TEST_ENTITIES.filter((e) => e.boolType)));
    });

    it('should support isNot operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { boolType: { isNot: true } } });
      expect(queryResult).toEqual(expect.arrayContaining(TEST_ENTITIES.filter((e) => !e.boolType)));
    });

    it('should support like operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { like: 'foo%' } } });
      expect(queryResult).toEqual(expect.arrayContaining(TEST_ENTITIES));
    });

    it('should support notLike operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { notLike: 'foo%' } } });
      expect(queryResult).toEqual([]);
    });

    it('should support iLike operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { iLike: 'FOO%' } } });
      expect(queryResult).toEqual(expect.arrayContaining(TEST_ENTITIES));
    });

    it('should support notILike operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { notILike: 'FOO%' } } });
      expect(queryResult).toEqual([]);
    });
  });

  describe('#aggregate', () => {
    it('call select with the aggregate columns and return the result', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.aggregate(
        {},
        {
          count: ['id'],
          avg: ['numberType'],
          sum: ['numberType'],
          max: ['id', 'dateType', 'numberType', 'stringType'],
          min: ['id', 'dateType', 'numberType', 'stringType'],
        },
      );
      return expect(queryResult).toEqual({
        avg: {
          numberType: 5.5,
        },
        count: {
          id: 10,
        },
        max: {
          dateType: TEST_ENTITIES[9].dateType,
          numberType: 10,
          stringType: 'foo9',
          id: expect.any(ObjectId),
        },
        min: {
          dateType: TEST_ENTITIES[0].dateType,
          numberType: 1,
          stringType: 'foo1',
          id: expect.any(ObjectId),
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
          count: ['id'],
          avg: ['numberType'],
          sum: ['numberType'],
          max: ['id', 'dateType', 'numberType', 'stringType'],
          min: ['id', 'dateType', 'numberType', 'stringType'],
        },
      );
      return expect(queryResult).toEqual({
        avg: {
          numberType: 2,
        },
        count: {
          id: 3,
        },
        max: {
          dateType: TEST_ENTITIES[2].dateType,
          numberType: 3,
          stringType: 'foo3',
          id: expect.any(ObjectId),
        },
        min: {
          dateType: TEST_ENTITIES[0].dateType,
          numberType: 1,
          stringType: 'foo1',
          id: expect.any(ObjectId),
        },
        sum: {
          numberType: 6,
        },
      });
    });
  });

  describe('#count', () => {
    it('should return number of elements matching a query', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const expectedEntities = TEST_ENTITIES.slice(0, 2);
      const count = await queryService.count({ stringType: { in: expectedEntities.map((e) => e.stringType) } });
      expect(count).toEqual(2);
    });
  });

  describe('#findById', () => {
    it('return the entity if found', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.findById(entity._id.toHexString());
      expect(found!).toEqual(entity);
    });

    it('return undefined if not found', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.findById(new ObjectId().toHexString());
      expect(found).toBeUndefined();
    });

    describe('with filter', () => {
      it('should return an entity if all filters match', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const found = await queryService.findById(entity._id.toHexString(), {
          filter: { stringType: { eq: entity.stringType } },
        });
        expect(found!).toEqual(entity);
      });

      it('should return an undefined if an entity with the pk and filter is not found', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const found = await queryService.findById(entity._id.toHexString(), {
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
      const found = await queryService.getById(entity._id.toHexString());
      expect(found).toEqual(entity);
    });

    it('return undefined if not found', () => {
      const badId = new ObjectId().toHexString();
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.getById(badId)).rejects.toThrow(`Unable to find TestEntity with id: ${badId}`);
    });

    describe('with filter', () => {
      it('should return an entity if all filters match', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const found = await queryService.getById(entity._id.toHexString(), {
          filter: { stringType: { eq: entity.stringType } },
        });
        expect(found).toEqual(entity);
      });

      it('should return an undefined if an entity with the pk and filter is not found', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.getById(entity._id.toHexString(), {
            filter: { stringType: { eq: TEST_ENTITIES[1].stringType } },
          }),
        ).rejects.toThrow(`Unable to find TestEntity with id: ${String(entity._id)}`);
      });
    });
  });

  describe('#createMany', () => {
    it('call save on the repo with instances of entities when passed plain objects', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createMany(TEST_ENTITIES.map(testEntityToCreate));
      expectEqualCreate(created, TEST_ENTITIES);
    });

    it('call save on the repo with instances of entities when passed instances', async () => {
      const instances = TEST_ENTITIES.map((e) => testEntityToCreate(e));
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createMany(instances);
      expectEqualCreate(created, TEST_ENTITIES);
    });

    it('should reject if the entities already exist', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.createMany(TEST_ENTITIES)).rejects.toThrow(
        'Id cannot be specified when updating or creating',
      );
    });
  });

  describe('#createOne', () => {
    it('call save on the repo with an instance of the entity when passed a plain object', async () => {
      const entity = testEntityToCreate(TEST_ENTITIES[0]);
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createOne(entity);
      expect(created).toEqual(expect.objectContaining(entity));
    });

    it('call save on the repo with an instance of the entity when passed an instance', async () => {
      const model = getModelForClass(TestEntity);
      const entity = new model(testEntityToCreate(TEST_ENTITIES[0]));
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createOne(entity);
      expect(created).toEqual(expect.objectContaining(entity));
    });

    it('should reject if the entity contains an id', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.createOne({ ...entity })).rejects.toThrow(
        'Id cannot be specified when updating or creating',
      );
    });
  });

  describe('#deleteMany', () => {
    it('delete all records that match the query', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const entities = TEST_ENTITIES.slice(0, 5);
      const { deletedCount } = await queryService.deleteMany({
        stringType: { in: entities.map((e) => e.stringType) },
      });
      expect(deletedCount).toEqual(5);
      const allCount = await queryService.count({});
      expect(allCount).toBe(5);
    });
  });

  describe('#deleteOne', () => {
    it('remove the entity', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const deleted = await queryService.deleteOne(TEST_ENTITIES[0]._id.toHexString());
      expect(deleted).toEqual(TEST_ENTITIES[0]);
    });

    it('call fail if the entity is not found', async () => {
      const badId = new ObjectId().toHexString();
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.deleteOne(badId)).rejects.toThrow(`Unable to find TestEntity with id: ${badId}`);
    });

    describe('with filter', () => {
      it('should delete the entity if all filters match', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const deleted = await queryService.deleteOne(entity._id.toHexString(), {
          filter: { stringType: { eq: entity.stringType } },
        });
        expect(deleted).toEqual(TEST_ENTITIES[0]);
      });

      it('should return throw an error if unable to find', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.deleteOne(entity._id.toHexString(), {
            filter: { stringType: { eq: TEST_ENTITIES[1].stringType } },
          }),
        ).rejects.toThrow(`Unable to find TestEntity with id: ${String(entity._id)}`);
      });
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
      return expect(queryService.updateMany({ id: new ObjectId().toHexString() }, {})).rejects.toThrow(
        'Id cannot be specified when updating',
      );
    });
  });

  describe('#updateOne', () => {
    it('update the entity', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const entity = TEST_ENTITIES[0];
      const update = { stringType: 'updated' };
      const updated = await queryService.updateOne(entity._id.toHexString(), update);
      expect(updated).toEqual(
        expect.objectContaining({
          _id: entity._id,
          ...update,
        }),
      );
    });

    it('update the entity with an instance of the entity', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const entity = TEST_ENTITIES[0];
      const model = getModelForClass(TestEntity);
      const update = new model({ stringType: 'updated' });
      const updated = await queryService.updateOne(entity._id.toHexString(), update);
      expect(updated).toEqual(
        expect.objectContaining({
          _id: entity._id,
          stringType: 'updated',
        }),
      );
    });

    it('should reject if the update contains the ID', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(
        queryService.updateOne(TEST_ENTITIES[0]._id.toHexString(), { id: new ObjectId().toHexString() }),
      ).rejects.toThrow('Id cannot be specified when updating');
    });

    it('call fail if the entity is not found', async () => {
      const badId = new ObjectId().toHexString();
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.updateOne(badId, { stringType: 'updated' })).rejects.toThrow(
        `Unable to find TestEntity with id: ${badId}`,
      );
    });

    describe('with filter', () => {
      it('should update the entity if all filters match', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const update = { stringType: 'updated' };
        const updated = await queryService.updateOne(entity._id.toHexString(), update, {
          filter: { stringType: { eq: entity.stringType } },
        });
        expect(updated).toEqual(expect.objectContaining({ _id: entity._id, ...update }));
      });

      it('should throw an error if unable to find the entity', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.updateOne(
            entity._id.toHexString(),
            { stringType: 'updated' },
            { filter: { stringType: { eq: TEST_ENTITIES[1].stringType } } },
          ),
        ).rejects.toThrow(`Unable to find TestEntity with id: ${String(entity._id)}`);
      });
    });
  });

  describe('#findRelation', () => {
    describe('with one entity', () => {
      it('call select and return the result', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestReference, 'testReference', entity);

        expect(queryResult!).toEqual(TEST_REFERENCES[0]);
      });

      it('apply the filter option', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult1 = await queryService.findRelation(TestReference, 'testReference', entity, {
          filter: { referenceName: { eq: TEST_REFERENCES[0].referenceName } },
        });
        expect(queryResult1!).toEqual(TEST_REFERENCES[0]);

        const queryResult2 = await queryService.findRelation(TestReference, 'testReference', entity, {
          filter: { referenceName: { eq: TEST_REFERENCES[1].referenceName } },
        });
        expect(queryResult2).toBeUndefined();
      });

      it('should return undefined select if no results are found.', async () => {
        const entity = TEST_ENTITIES[0];
        await TestEntityModel.updateOne({ _id: entity._id }, { $set: { testReference: undefined } });
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestReference, 'testReference', entity);
        expect(queryResult).toBeUndefined();
      });

      it('throw an error if a relation with that name is not found.', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const entity = TEST_ENTITIES[0];
        return expect(queryService.findRelation(TestReference, 'badReference', entity)).rejects.toThrow(
          'Unable to find reference badReference on TestEntity',
        );
      });

      describe('virtual reference', () => {
        it('call select and return the result', async () => {
          const entity = TEST_REFERENCES[0];
          const queryService = moduleRef.get(TestReferenceService);
          const queryResult = await queryService.findRelation(TestEntity, 'virtualTestEntity', entity);

          expect(queryResult!).toEqual(TEST_ENTITIES[0]);
        });

        it('apply the filter option', async () => {
          const entity = TEST_REFERENCES[0];
          const queryService = moduleRef.get(TestReferenceService);
          const queryResult1 = await queryService.findRelation(TestEntity, 'virtualTestEntity', entity, {
            filter: { stringType: { eq: TEST_ENTITIES[0].stringType } },
          });
          expect(queryResult1!).toEqual(TEST_ENTITIES[0]);

          const queryResult2 = await queryService.findRelation(TestEntity, 'virtualTestEntity', entity, {
            filter: { stringType: { eq: TEST_ENTITIES[1].stringType } },
          });
          expect(queryResult2).toBeUndefined();
        });

        it('should return undefined select if no results are found.', async () => {
          const entity = TEST_REFERENCES[0];
          await TestReferenceModel.updateOne({ _id: entity._id }, { $set: { testEntity: undefined } });
          const queryService = moduleRef.get(TestReferenceService);
          const queryResult = await queryService.findRelation(TestEntity, 'virtualTestEntity', entity);
          expect(queryResult).toBeUndefined();
        });

        it('throw an error if a relation with that name is not found.', async () => {
          const entity = TEST_REFERENCES[0];
          const queryService = moduleRef.get(TestReferenceService);
          return expect(queryService.findRelation(TestEntity, 'badReference', entity)).rejects.toThrow(
            'Unable to find reference badReference on TestReference',
          );
        });
      });
    });

    describe('with multiple entities', () => {
      it('call select and return the result', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestReference, 'testReference', entities);

        expect(queryResult).toEqual(
          new Map([
            [entities[0], expect.objectContaining(TEST_REFERENCES[0])],
            [entities[1], expect.objectContaining(TEST_REFERENCES[3])],
            [entities[2], expect.objectContaining(TEST_REFERENCES[6])],
          ]),
        );
      });

      // it('should apply the filter option', async () => {
      //   const entities: DocumentType<TestEntity>[] = TEST_ENTITIES.slice(0, 3);
      //   const queryService = moduleRef.get(TestEntityService);
      //   const queryResult = await queryService.findRelation(TestReference, 'testReference', entities, {
      //     filter: {
      //       id: { in: [TEST_REFERENCES[0]._id, TEST_REFERENCES[6]._id] },
      //     },
      //   });
      //   expect(queryResult).toEqual(
      //     new Map([
      //       [entities[0], expect.objectContaining(TEST_REFERENCES[0])],
      //       [entities[1], undefined],
      //       [entities[2], expect.objectContaining(TEST_REFERENCES[6])],
      //     ]),
      //   );
      // });

      it('should return undefined select if no results are found.', async () => {
        const entities: DocumentType<TestEntity>[] = [
          TEST_ENTITIES[0],
          { _id: new ObjectId() } as DocumentType<TestEntity>,
        ];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestReference, 'testReference', entities);

        expect(queryResult).toEqual(
          new Map([
            [entities[0], expect.objectContaining(TEST_REFERENCES[0])],
            [entities[1], undefined],
          ]),
        );
      });
    });
  });
});
