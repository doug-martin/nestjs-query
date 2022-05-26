/* eslint-disable no-underscore-dangle,@typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model, Document, LeanDocument, Types } from 'mongoose';
import { SortDirection } from '@ptc-org/nestjs-query-core';
import { MongooseQueryService } from '../../src/services';
import {
  TestReference,
  TestEntity,
  TEST_ENTITIES,
  TEST_REFERENCES,
  getConnectionUri,
  prepareDb,
  closeDbConnection,
  dropDatabase,
  TestEntitySchema,
  TestReferenceSchema
} from '../__fixtures__';
import { NestjsQueryMongooseModule } from '../../src';

describe('MongooseQueryService', () => {
  let moduleRef: TestingModule;
  let TestEntityModel: Model<TestEntity>;
  let TestReferenceModel: Model<TestReference>;

  class TestEntityService extends MongooseQueryService<TestEntity> {
    constructor(@InjectModel(TestEntity.name) readonly model: Model<TestEntity>) {
      super(model);
      TestEntityModel = model;
    }
  }

  class TestReferenceService extends MongooseQueryService<TestReference> {
    constructor(@InjectModel(TestReference.name) readonly model: Model<TestReference>) {
      super(model);
      TestReferenceModel = model;
    }
  }

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(await getConnectionUri()),
        NestjsQueryMongooseModule.forFeature([
          { name: TestReference.name, document: TestReference, schema: TestReferenceSchema },
          { name: TestEntity.name, document: TestEntity, schema: TestEntitySchema }
        ])
      ],
      providers: [TestReferenceService, TestEntityService]
    }).compile();
  });

  function convertDocument<Doc extends Document>(doc: Doc): Doc {
    return doc.toObject({ virtuals: true });
    // return doc.toObject({ virtuals: true });
  }

  function convertDocuments<Doc extends Document>(docs: Doc[]): Doc[] {
    return docs.map((doc) => convertDocument(doc));
  }

  function testEntityToObject(te: TestEntity): Partial<TestEntity> {
    return {
      _id: te._id,
      stringType: te.stringType,
      boolType: te.boolType,
      numberType: te.numberType,
      dateType: te.dateType
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
      expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(TEST_ENTITIES));
    });

    it('should support eq operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { eq: 'foo1' } } });
      expect(convertDocuments(queryResult)).toEqual([TEST_ENTITIES[0]]);
    });

    it('should support neq operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { neq: 'foo1' } } });
      expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(TEST_ENTITIES.slice(1)));
    });

    it('should support gt operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { numberType: { gt: 5 } } });
      expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(TEST_ENTITIES.slice(5)));
    });

    it('should support gte operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { numberType: { gte: 5 } } });
      expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(TEST_ENTITIES.slice(4)));
    });

    it('should support lt operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { numberType: { lt: 5 } } });
      expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(TEST_ENTITIES.slice(0, 4)));
    });

    it('should support lte operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { numberType: { lte: 5 } } });
      expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(TEST_ENTITIES.slice(0, 5)));
    });

    it('should support in operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { numberType: { in: [1, 2, 3] } } });
      expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(TEST_ENTITIES.slice(0, 3)));
    });

    it('should support notIn operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { numberType: { notIn: [1, 2, 3] } } });
      expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(TEST_ENTITIES.slice(4)));
    });

    it('should support is operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { boolType: { is: true } } });
      expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(TEST_ENTITIES.filter((e) => e.boolType)));
    });

    it('should support isNot operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { boolType: { isNot: true } } });
      expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(TEST_ENTITIES.filter((e) => !e.boolType)));
    });

    it('should support like operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { like: 'foo%' } } });
      expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(TEST_ENTITIES));
    });

    it('should support notLike operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { notLike: 'foo%' } } });
      expect(convertDocuments(queryResult)).toEqual([]);
    });

    it('should support iLike operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { iLike: 'FOO%' } } });
      expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(TEST_ENTITIES));
    });

    it('should support notILike operator', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.query({ filter: { stringType: { notILike: 'FOO%' } } });
      expect(convertDocuments(queryResult)).toEqual([]);
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
          min: ['id', 'dateType', 'numberType', 'stringType']
        }
      );
      return expect(queryResult).toEqual([
        {
          avg: {
            numberType: 5.5
          },
          count: {
            id: 10
          },
          max: {
            dateType: TEST_ENTITIES[9].dateType,
            numberType: 10,
            stringType: 'foo9',
            id: expect.any(Types.ObjectId)
          },
          min: {
            dateType: TEST_ENTITIES[0].dateType,
            numberType: 1,
            stringType: 'foo1',
            id: expect.any(Types.ObjectId)
          },
          sum: {
            numberType: 55
          }
        }
      ]);
    });

    it('allow aggregates with groupBy', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.aggregate(
        {},
        {
          groupBy: ['boolType'],
          count: ['id'],
          avg: ['numberType'],
          sum: ['numberType'],
          max: ['id', 'dateType', 'numberType', 'stringType'],
          min: ['id', 'dateType', 'numberType', 'stringType']
        }
      );
      return expect(queryResult).toEqual([
        {
          groupBy: {
            boolType: false
          },
          avg: {
            numberType: 5
          },
          count: {
            id: 5
          },
          max: {
            dateType: TEST_ENTITIES[8].dateType,
            numberType: 9,
            stringType: 'foo9',
            id: expect.any(Types.ObjectId)
          },
          min: {
            dateType: TEST_ENTITIES[0].dateType,
            numberType: 1,
            stringType: 'foo1',
            id: expect.any(Types.ObjectId)
          },
          sum: {
            numberType: 25
          }
        },
        {
          groupBy: {
            boolType: true
          },
          avg: {
            numberType: 6
          },
          count: {
            id: 5
          },
          max: {
            dateType: TEST_ENTITIES[9].dateType,
            numberType: 10,
            stringType: 'foo8',
            id: expect.any(Types.ObjectId)
          },
          min: {
            dateType: TEST_ENTITIES[1].dateType,
            numberType: 2,
            stringType: 'foo10',
            id: expect.any(Types.ObjectId)
          },
          sum: {
            numberType: 30
          }
        }
      ]);
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
          min: ['id', 'dateType', 'numberType', 'stringType']
        }
      );
      return expect(queryResult).toEqual([
        {
          avg: {
            numberType: 2
          },
          count: {
            id: 3
          },
          max: {
            dateType: TEST_ENTITIES[2].dateType,
            numberType: 3,
            stringType: 'foo3',
            id: expect.any(Types.ObjectId)
          },
          min: {
            dateType: TEST_ENTITIES[0].dateType,
            numberType: 1,
            stringType: 'foo1',
            id: expect.any(Types.ObjectId)
          },
          sum: {
            numberType: 6
          }
        }
      ]);
    });
  });

  describe('#count', () => {
    it('should return number of elements matching a query', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const expectedEntities = TEST_ENTITIES.slice(0, 2);
      const count = await queryService.count({ stringType: { in: expectedEntities.map((e) => e.stringType) } });
      expect(count).toBe(2);
    });
  });

  describe('#findById', () => {
    it('return the entity if found', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.findById(entity._id);
      expect(convertDocument(found)).toEqual(entity);
    });

    it('return undefined if not found', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.findById(new Types.ObjectId().toHexString());
      expect(found).toBeUndefined();
    });

    describe('with filter', () => {
      it('should return an entity if all filters match', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const found = await queryService.findById(entity._id, {
          filter: { stringType: { eq: entity.stringType } }
        });
        expect(convertDocument(found)).toEqual(entity);
      });

      it('should return an undefined if an entity with the pk and filter is not found', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const found = await queryService.findById(entity._id, {
          filter: { stringType: { eq: TEST_ENTITIES[1].stringType } }
        });
        expect(found).toBeUndefined();
      });
    });
  });

  describe('#getById', () => {
    it('return the entity if found', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const found = await queryService.getById(entity._id);
      expect(convertDocument(found)).toEqual(entity);
    });

    it('return undefined if not found', () => {
      const badId = new Types.ObjectId().toHexString();
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.getById(badId)).rejects.toThrow(`Unable to find TestEntity with id: ${badId}`);
    });

    describe('with filter', () => {
      it('should return an entity if all filters match', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const found = await queryService.getById(entity._id, {
          filter: { stringType: { eq: entity.stringType } }
        });
        expect(convertDocument(found)).toEqual(entity);
      });

      it('should return an undefined if an entity with the pk and filter is not found', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.getById(entity._id, {
            filter: { stringType: { eq: TEST_ENTITIES[1].stringType } }
          })
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
      const instances = TEST_ENTITIES.map((e) => new TestEntityModel(testEntityToCreate(e)));
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createMany(instances);
      expectEqualCreate(created, TEST_ENTITIES);
    });

    it('should reject if the entities already exist', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.createMany(TEST_ENTITIES)).rejects.toThrow(
        'Id cannot be specified when updating or creating'
      );
    });
  });

  describe('#createOne', () => {
    it('call save on the repo with an instance of the entity when passed a plain object', async () => {
      const entity = testEntityToCreate(TEST_ENTITIES[0]);
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createOne(entity);
      expect(convertDocument(created)).toEqual(expect.objectContaining(entity));
    });

    it('call save on the repo with an instance of the entity when passed an instance', async () => {
      const entity = new TestEntityModel(testEntityToCreate(TEST_ENTITIES[0]));
      const queryService = moduleRef.get(TestEntityService);
      const created = await queryService.createOne(entity);
      expect(convertDocument(created)).toEqual(expect.objectContaining(entity.toObject({ virtuals: true })));
    });

    it('should reject if the entity contains an id', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.createOne({ ...entity })).rejects.toThrow(
        'Id cannot be specified when updating or creating'
      );
    });
  });

  describe('#deleteMany', () => {
    it('delete all records that match the query', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const entities = TEST_ENTITIES.slice(0, 5);
      const { deletedCount } = await queryService.deleteMany({
        stringType: { in: entities.map((e) => e.stringType) }
      });
      expect(deletedCount).toBe(5);
      const allCount = await queryService.count({});
      expect(allCount).toBe(5);
    });
  });

  describe('#deleteOne', () => {
    it('remove the entity', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const deleted = await queryService.deleteOne(TEST_ENTITIES[0]._id);
      expect(convertDocument(deleted)).toEqual(TEST_ENTITIES[0]);
    });

    it('call fail if the entity is not found', async () => {
      const badId = new Types.ObjectId().toHexString();
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.deleteOne(badId)).rejects.toThrow(`Unable to find TestEntity with id: ${badId}`);
    });

    describe('with filter', () => {
      it('should delete the entity if all filters match', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const deleted = await queryService.deleteOne(entity._id, {
          filter: { stringType: { eq: entity.stringType } }
        });
        expect(convertDocument(deleted)).toEqual(TEST_ENTITIES[0]);
      });

      it('should return throw an error if unable to find', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.deleteOne(entity._id, {
            filter: { stringType: { eq: TEST_ENTITIES[1].stringType } }
          })
        ).rejects.toThrow(`Unable to find TestEntity with id: ${String(entity._id)}`);
      });
    });
  });

  describe('#updateMany', () => {
    it('update all entities in the filter', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const filter = {
        stringType: { in: TEST_ENTITIES.slice(0, 5).map((e) => e.stringType) }
      };
      await queryService.updateMany({ stringType: 'updated' }, filter);
      const entities = await queryService.query({ filter: { stringType: { eq: 'updated' } } });
      expect(entities).toHaveLength(5);
    });

    it('should reject if the update contains the ID', () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.updateMany({ id: new Types.ObjectId().toHexString() }, {})).rejects.toThrow(
        'Id cannot be specified when updating'
      );
    });
  });

  describe('#updateOne', () => {
    it('update the entity', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const entity = TEST_ENTITIES[0];
      const update = { stringType: 'updated' };
      const updated = await queryService.updateOne(entity._id, update);
      expect(updated).toEqual(
        expect.objectContaining({
          _id: entity._id,
          ...update
        })
      );
    });

    it('update the entity with an instance of the entity', async () => {
      const queryService = moduleRef.get(TestEntityService);
      const entity = TEST_ENTITIES[0];
      const update = new TestEntityModel({ stringType: 'updated' });
      const updated = await queryService.updateOne(entity._id, update);
      expect(updated).toEqual(
        expect.objectContaining({
          _id: entity._id,
          stringType: 'updated'
        })
      );
    });

    it('should reject if the update contains the ID', async () => {
      const queryService = moduleRef.get(TestEntityService);
      return expect(
        queryService.updateOne(TEST_ENTITIES[0]._id, { id: new Types.ObjectId().toHexString() })
      ).rejects.toThrow('Id cannot be specified when updating');
    });

    it('call fail if the entity is not found', async () => {
      const badId = new Types.ObjectId().toHexString();
      const queryService = moduleRef.get(TestEntityService);
      return expect(queryService.updateOne(badId, { stringType: 'updated' })).rejects.toThrow(
        `Unable to find TestEntity with id: ${badId}`
      );
    });

    describe('with filter', () => {
      it('should update the entity if all filters match', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const update = { stringType: 'updated' };
        const updated = await queryService.updateOne(entity._id, update, {
          filter: { stringType: { eq: entity.stringType } }
        });
        expect(updated).toEqual(expect.objectContaining({ _id: entity._id, ...update }));
      });

      it('should throw an error if unable to find the entity', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.updateOne(
            entity._id,
            { stringType: 'updated' },
            { filter: { stringType: { eq: TEST_ENTITIES[1].stringType } } }
          )
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

        expect(convertDocument(queryResult)).toEqual(TEST_REFERENCES[0]);
      });

      it('apply the filter option', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult1 = await queryService.findRelation(TestReference, 'testReference', entity, {
          filter: { referenceName: { eq: TEST_REFERENCES[0].referenceName } }
        });
        expect(convertDocument(queryResult1)).toEqual(TEST_REFERENCES[0]);

        const queryResult2 = await queryService.findRelation(TestReference, 'testReference', entity, {
          filter: { referenceName: { eq: TEST_REFERENCES[1].referenceName } }
        });
        expect(queryResult2).toBeUndefined();
      });

      // it('should return undefined select if no results are found.', async () => {
      //   const entity = TEST_ENTITIES[0];
      //   await TestEntityModel.updateOne({ _id: entity._id }, { $set: { testReference: undefined } });
      //   const queryService = moduleRef.get(TestEntityService);
      //   const queryResult = await queryService.findRelation(TestReference, 'testReference', entity);
      //
      //   expect(queryResult).toBeUndefined();
      // });

      it('throw an error if a relation with that name is not found.', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const entity = TEST_ENTITIES[0];
        return expect(queryService.findRelation(TestReference, 'badReference', entity)).rejects.toThrow(
          'Unable to find reference badReference on TestEntity'
        );
      });

      describe('virtual reference', () => {
        it('call select and return the result', async () => {
          const entity = TEST_REFERENCES[0];
          const queryService = moduleRef.get(TestReferenceService);
          const queryResult = await queryService.findRelation(TestEntity, 'virtualTestEntity', entity);

          expect(convertDocument(queryResult)).toEqual(TEST_ENTITIES[0]);
        });

        it('apply the filter option', async () => {
          const entity = TEST_REFERENCES[0];
          const queryService = moduleRef.get(TestReferenceService);
          const queryResult1 = await queryService.findRelation(TestEntity, 'virtualTestEntity', entity, {
            filter: { stringType: { eq: TEST_ENTITIES[0].stringType } }
          });
          expect(convertDocument(queryResult1)).toEqual(TEST_ENTITIES[0]);

          const queryResult2 = await queryService.findRelation(TestEntity, 'virtualTestEntity', entity, {
            filter: { stringType: { eq: TEST_ENTITIES[1].stringType } }
          });
          expect(queryResult2).toBeUndefined();
        });

        // it('should return undefined select if no results are found.', async () => {
        //   const entity = TEST_REFERENCES[0];
        //   await TestReferenceModel.updateOne({ _id: entity._id }, { $set: { testEntity: undefined } });
        //   const queryService = moduleRef.get(TestReferenceService);
        //   const queryResult = await queryService.findRelation(TestEntity, 'virtualTestEntity', entity);
        //   expect(queryResult).toBeUndefined();
        // });

        it('throw an error if a relation with that name is not found.', async () => {
          const entity = TEST_REFERENCES[0];
          const queryService = moduleRef.get(TestReferenceService);
          return expect(queryService.findRelation(TestEntity, 'badReference', entity)).rejects.toThrow(
            'Unable to find reference badReference on TestReference'
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
            [entities[2], expect.objectContaining(TEST_REFERENCES[6])]
          ])
        );
      });

      it('should apply the filter option', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestReference, 'testReference', entities, {
          filter: {
            id: { in: [TEST_REFERENCES[0]._id, TEST_REFERENCES[6]._id] }
          }
        });
        expect(queryResult).toEqual(
          new Map([
            [entities[0], expect.objectContaining(TEST_REFERENCES[0])],
            [entities[1], undefined],
            [entities[2], expect.objectContaining(TEST_REFERENCES[6])]
          ])
        );
      });

      it('should return undefined select if no results are found.', async () => {
        const entities: TestEntity[] = [TEST_ENTITIES[0], { _id: new Types.ObjectId() } as TestEntity];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.findRelation(TestReference, 'testReference', entities);

        expect(queryResult).toEqual(
          new Map([
            [entities[0], expect.objectContaining(TEST_REFERENCES[0])],
            [entities[1], undefined]
          ])
        );
      });
    });
  });

  describe('#queryRelations', () => {
    describe('with one entity', () => {
      it('call select and return the result', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestReference, 'testReferences', TEST_ENTITIES[0], {
          filter: { referenceName: { isNot: null } }
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return expect(convertDocuments(queryResult)).toEqual(TEST_REFERENCES.slice(0, 3));
      });

      it('should apply a filter', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestReference, 'testReferences', TEST_ENTITIES[0], {
          filter: { referenceName: { eq: TEST_REFERENCES[1].referenceName } }
        });
        expect(convertDocuments(queryResult)).toEqual([TEST_REFERENCES[1]]);
      });

      it('should apply paging', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestReference, 'testReferences', TEST_ENTITIES[0], {
          paging: { limit: 2, offset: 1 }
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        expect(convertDocuments(queryResult)).toEqual(TEST_REFERENCES.slice(1, 3));
      });
    });

    describe('with virtual entity', () => {
      it('call select and return the result', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(
          TestReference,
          'virtualTestReferences',
          TEST_ENTITIES[0],
          {
            filter: { referenceName: { isNot: null } }
          }
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(TEST_REFERENCES.slice(0, 3)));
      });

      it('should apply a filter', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(
          TestReference,
          'virtualTestReferences',
          TEST_ENTITIES[0],
          {
            filter: { referenceName: { eq: TEST_REFERENCES[1].referenceName } }
          }
        );
        expect(convertDocuments(queryResult)).toEqual([TEST_REFERENCES[1]]);
      });

      it('should apply paging', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(
          TestReference,
          'virtualTestReferences',
          TEST_ENTITIES[0],
          {
            paging: { limit: 2, offset: 1 },
            sorting: [{ field: 'referenceName', direction: SortDirection.ASC }]
          }
        );
        expect(convertDocuments(queryResult)).toEqual(TEST_REFERENCES.slice(1, 3));
      });
    });

    describe('with multiple entities', () => {
      it('call return a map of results for each entity', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestReference, 'testReferences', entities, {
          filter: { referenceName: { isNot: null } }
        });
        expect(queryResult.size).toBe(3);
        expect(convertDocuments(queryResult.get(entities[0])!)).toEqual(TEST_REFERENCES.slice(0, 3));
        expect(convertDocuments(queryResult.get(entities[1])!)).toEqual(TEST_REFERENCES.slice(3, 6));
        expect(convertDocuments(queryResult.get(entities[2])!)).toEqual(TEST_REFERENCES.slice(6, 9));
      });

      it('should apply a filter per entity', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const references = [TEST_REFERENCES[1], TEST_REFERENCES[4], TEST_REFERENCES[7]];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestReference, 'testReferences', entities, {
          filter: { referenceName: { in: references.map((r) => r.referenceName) } }
        });
        expect(queryResult.size).toBe(3);
        expect(convertDocuments(queryResult.get(entities[0])!)).toEqual([references[0]]);
        expect(convertDocuments(queryResult.get(entities[1])!)).toEqual([references[1]]);
        expect(convertDocuments(queryResult.get(entities[2])!)).toEqual([references[2]]);
      });

      it('should apply paging per entity', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestReference, 'testReferences', entities, {
          paging: { limit: 2, offset: 1 }
        });
        expect(queryResult.size).toBe(3);
        expect(convertDocuments(queryResult.get(entities[0])!)).toEqual(TEST_REFERENCES.slice(1, 3));
        expect(convertDocuments(queryResult.get(entities[1])!)).toEqual(TEST_REFERENCES.slice(4, 6));
        expect(convertDocuments(queryResult.get(entities[2])!)).toEqual(TEST_REFERENCES.slice(7, 9));
      });

      it('should return an empty array if no results are found.', async () => {
        const entities: TestEntity[] = [TEST_ENTITIES[0], { id: new Types.ObjectId() } as TestEntity];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.queryRelations(TestReference, 'testReferences', entities, {
          filter: { referenceName: { isNot: null } }
        });
        expect(queryResult.size).toBe(2);
        expect(convertDocuments(queryResult.get(entities[0])!)).toEqual(TEST_REFERENCES.slice(0, 3));
        expect(convertDocuments(queryResult.get(entities[1])!)).toEqual([]);
      });
    });
  });

  describe('#aggregateRelations', () => {
    describe('with one entity', () => {
      it('should return an aggregate', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const aggResult = await queryService.aggregateRelations(
          TestReference,
          'testReferences',
          TEST_ENTITIES[0],
          { referenceName: { isNot: null } },
          { count: ['id'] }
        );
        return expect(aggResult).toEqual([
          {
            count: {
              id: 3
            }
          }
        ]);
      });

      it('should support groupBy when aggregating relations', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const aggResult = await queryService.aggregateRelations(
          TestReference,
          'testReferences',
          TEST_ENTITIES[0],
          { referenceName: { isNot: null } },
          { groupBy: ['testEntity'], count: ['id'] }
        );
        return expect(aggResult).toEqual([
          {
            groupBy: { testEntity: TEST_ENTITIES[0]._id },
            count: {
              id: 3
            }
          }
        ]);
      });
    });

    describe('with virtual relation', () => {
      it('call select and return the result', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const aggResult = await queryService.aggregateRelations(
          TestReference,
          'virtualTestReferences',
          TEST_ENTITIES[0],
          { referenceName: { isNot: null } },
          { count: ['id'] }
        );
        return expect(aggResult).toEqual([
          {
            count: {
              id: 3
            }
          }
        ]);
      });
    });

    describe('with multiple entities', () => {
      it('return a relation aggregate for each entity', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.aggregateRelations(
          TestReference,
          'testReferences',
          entities,
          { referenceName: { isNot: null } },
          {
            count: ['id', 'referenceName', 'testEntity'],
            min: ['id', 'referenceName', 'testEntity'],
            max: ['id', 'referenceName', 'testEntity']
          }
        );

        expect(queryResult.size).toBe(3);
        expect(queryResult).toEqual(
          new Map([
            [
              entities[0],
              [
                {
                  count: {
                    referenceName: 3,
                    testEntity: 3,
                    id: 3
                  },
                  max: {
                    referenceName: TEST_REFERENCES[2].referenceName,
                    testEntity: entities[0]._id,
                    id: expect.any(Types.ObjectId)
                  },
                  min: {
                    referenceName: TEST_REFERENCES[0].referenceName,
                    testEntity: entities[0]._id,
                    id: expect.any(Types.ObjectId)
                  }
                }
              ]
            ],
            [
              entities[1],
              [
                {
                  count: {
                    referenceName: 3,
                    testEntity: 3,
                    id: 3
                  },
                  max: {
                    referenceName: TEST_REFERENCES[5].referenceName,
                    testEntity: entities[1]._id,
                    id: expect.any(Types.ObjectId)
                  },
                  min: {
                    referenceName: TEST_REFERENCES[3].referenceName,
                    testEntity: entities[1]._id,
                    id: expect.any(Types.ObjectId)
                  }
                }
              ]
            ],
            [
              entities[2],
              [
                {
                  count: {
                    referenceName: 3,
                    testEntity: 3,
                    id: 3
                  },
                  max: {
                    referenceName: TEST_REFERENCES[8].referenceName,
                    testEntity: entities[2]._id,
                    id: expect.any(Types.ObjectId)
                  },
                  min: {
                    referenceName: TEST_REFERENCES[6].referenceName,
                    testEntity: entities[2]._id,
                    id: expect.any(Types.ObjectId)
                  }
                }
              ]
            ]
          ])
        );
      });

      it('aggregate and group for each entities relation', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.aggregateRelations(
          TestReference,
          'testReferences',
          entities,
          { referenceName: { isNot: null } },
          {
            groupBy: ['testEntity'],
            count: ['id', 'referenceName', 'testEntity'],
            min: ['id', 'referenceName', 'testEntity'],
            max: ['id', 'referenceName', 'testEntity']
          }
        );

        expect(queryResult.size).toBe(3);
        expect(queryResult).toEqual(
          new Map([
            [
              entities[0],
              [
                {
                  groupBy: { testEntity: entities[0]._id },
                  count: {
                    referenceName: 3,
                    testEntity: 3,
                    id: 3
                  },
                  max: {
                    referenceName: TEST_REFERENCES[2].referenceName,
                    testEntity: entities[0]._id,
                    id: expect.any(Types.ObjectId)
                  },
                  min: {
                    referenceName: TEST_REFERENCES[0].referenceName,
                    testEntity: entities[0]._id,
                    id: expect.any(Types.ObjectId)
                  }
                }
              ]
            ],
            [
              entities[1],
              [
                {
                  groupBy: { testEntity: entities[1]._id },
                  count: {
                    referenceName: 3,
                    testEntity: 3,
                    id: 3
                  },
                  max: {
                    referenceName: TEST_REFERENCES[5].referenceName,
                    testEntity: entities[1]._id,
                    id: expect.any(Types.ObjectId)
                  },
                  min: {
                    referenceName: TEST_REFERENCES[3].referenceName,
                    testEntity: entities[1]._id,
                    id: expect.any(Types.ObjectId)
                  }
                }
              ]
            ],
            [
              entities[2],
              [
                {
                  groupBy: { testEntity: entities[2]._id },
                  count: {
                    referenceName: 3,
                    testEntity: 3,
                    id: 3
                  },
                  max: {
                    referenceName: TEST_REFERENCES[8].referenceName,
                    testEntity: entities[2]._id,
                    id: expect.any(Types.ObjectId)
                  },
                  min: {
                    referenceName: TEST_REFERENCES[6].referenceName,
                    testEntity: entities[2]._id,
                    id: expect.any(Types.ObjectId)
                  }
                }
              ]
            ]
          ])
        );
      });

      it('should return an empty array if no results are found.', async () => {
        const entities: TestEntity[] = [TEST_ENTITIES[0], { _id: new Types.ObjectId() } as TestEntity];
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.aggregateRelations(
          TestReference,
          'testReferences',
          entities,
          { referenceName: { isNot: null } },
          {
            count: ['id', 'referenceName', 'testEntity'],
            min: ['id', 'referenceName', 'testEntity'],
            max: ['id', 'referenceName', 'testEntity']
          }
        );

        expect(queryResult).toEqual(
          new Map([
            [
              entities[0],
              [
                {
                  count: {
                    referenceName: 3,
                    testEntity: 3,
                    id: 3
                  },
                  max: {
                    referenceName: TEST_REFERENCES[2].referenceName,
                    testEntity: entities[0]._id,
                    id: expect.any(Types.ObjectId)
                  },
                  min: {
                    referenceName: TEST_REFERENCES[0].referenceName,
                    testEntity: entities[0]._id,
                    id: expect.any(Types.ObjectId)
                  }
                }
              ]
            ],
            [entities[1], []]
          ])
        );
      });
    });
  });

  describe('#countRelations', () => {
    describe('with one entity', () => {
      it('count the references', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const entity = TEST_ENTITIES[0];
        const countResult = await queryService.countRelations(TestReference, 'testReferences', entity, {
          referenceName: { in: [TEST_REFERENCES[1].referenceName, TEST_REFERENCES[2].referenceName] }
        });
        return expect(countResult).toBe(2);
      });

      it('should return a rejected promise if the relation is not found', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const entity = TEST_ENTITIES[0];
        return expect(
          queryService.countRelations(TestReference, 'badReferences', entity, {
            referenceName: { in: [TEST_REFERENCES[1].referenceName, TEST_REFERENCES[2].referenceName] }
          })
        ).rejects.toThrow('Unable to find reference badReferences on TestEntity');
      });
    });

    describe('with virtual entity', () => {
      it('count references', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const entity = TEST_ENTITIES[0];
        const countResult = await queryService.countRelations(TestReference, 'virtualTestReferences', entity, {});
        return expect(countResult).toBe(3);
      });
      it('count and return the result', async () => {
        const queryService = moduleRef.get(TestEntityService);
        const entity = TEST_ENTITIES[0];
        const countResult = await queryService.countRelations(TestReference, 'virtualTestReferences', entity, {
          referenceName: { in: [TEST_REFERENCES[1].referenceName, TEST_REFERENCES[2].referenceName] }
        });
        return expect(countResult).toBe(2);
      });
    });

    describe('with multiple entities', () => {
      it('call count and return the result', async () => {
        const entities = TEST_ENTITIES.slice(0, 3);
        const queryService = moduleRef.get(TestEntityService);
        const queryResult = await queryService.countRelations(TestReference, 'testReferences', entities, {
          referenceName: {
            in: [
              TEST_REFERENCES[1].referenceName,
              TEST_REFERENCES[2].referenceName,
              TEST_REFERENCES[4].referenceName,
              TEST_REFERENCES[5].referenceName,
              TEST_REFERENCES[7].referenceName,
              TEST_REFERENCES[8].referenceName
            ]
          }
        });

        expect(queryResult).toEqual(
          new Map([
            [entities[0], 2],
            [entities[1], 2],
            [entities[2], 2]
          ])
        );
      });
    });
  });

  describe('#addRelations', () => {
    it('call select and return the result', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.addRelations(
        'testReferences',
        entity._id,
        TEST_REFERENCES.slice(3, 6).map((r) => r._id)
      );
      expect(queryResult).toEqual(
        expect.objectContaining({
          _id: entity._id,
          testReferences: expect.arrayContaining(TEST_REFERENCES.slice(0, 6).map((r) => r._id))
        })
      );

      const relations = await queryService.queryRelations(TestReference, 'testReferences', entity, {});
      expect(relations).toHaveLength(6);
    });

    it('should not modify relations if relationIds is empty', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.addRelations('testReferences', entity._id, []);
      expect(queryResult).toEqual(
        expect.objectContaining({
          _id: entity._id,
          testReferences: expect.arrayContaining(TEST_REFERENCES.slice(0, 3).map((r) => r._id))
        })
      );

      const relations = await queryService.queryRelations(TestReference, 'testReferences', entity, {});
      expect(relations).toHaveLength(3);
    });

    describe('with virtual reference', () => {
      it('should return a rejected promise', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.addRelations(
            'virtualTestReferences',
            entity._id,
            TEST_REFERENCES.slice(3, 6).map((r) => r._id)
          )
        ).rejects.toThrow('AddRelations not supported for virtual relation virtualTestReferences');
      });
    });

    describe('with modify options', () => {
      it('should throw an error if the entity is not found with the id and provided filter', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.addRelations(
            'testReferences',
            entity._id,
            TEST_REFERENCES.slice(3, 6).map((r) => r._id),
            {
              filter: { stringType: { eq: TEST_ENTITIES[1].stringType } }
            }
          )
        ).rejects.toThrow(`Unable to find TestEntity with id: ${String(entity._id)}`);
      });

      it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.addRelations<TestReference>(
            'testReferences',
            entity._id,
            TEST_REFERENCES.slice(3, 6).map((r) => r._id),
            {
              relationFilter: { referenceName: { like: '%-one' } }
            }
          )
        ).rejects.toThrow('Unable to find all testReferences to add to TestEntity');
      });
    });
  });

  describe('#setRelations', () => {
    it('set all relations on the entity', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const relationIds = TEST_REFERENCES.slice(3, 6).map((r) => r._id);
      const queryResult = await queryService.setRelations('testReferences', entity._id, relationIds);
      expect(queryResult).toEqual(
        expect.objectContaining({
          _id: entity._id,
          testReferences: expect.arrayContaining(relationIds)
        })
      );

      const relations = await queryService.queryRelations(TestReference, 'testReferences', entity, {});
      expect(relations.map((r) => r._id)).toEqual(relationIds);
    });

    it('should remove all relations if the relationIds is empty', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.setRelations('testReferences', entity._id, []);
      expect(queryResult).toEqual(
        expect.objectContaining({
          _id: entity._id,
          testReferences: expect.arrayContaining([])
        })
      );

      const relations = await queryService.queryRelations(TestReference, 'testReferences', entity, {});
      expect(relations.map((r) => r._id)).toEqual([]);
    });

    describe('with modify options', () => {
      it('should throw an error if the entity is not found with the id and provided filter', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.setRelations(
            'testReferences',
            entity._id,
            TEST_REFERENCES.slice(3, 6).map((r) => r._id),
            {
              filter: { stringType: { eq: TEST_ENTITIES[1].stringType } }
            }
          )
        ).rejects.toThrow(`Unable to find TestEntity with id: ${String(entity._id)}`);
      });

      it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.setRelations<TestReference>(
            'testReferences',
            entity._id,
            TEST_REFERENCES.slice(3, 6).map((r) => r._id),
            {
              relationFilter: { referenceName: { like: '%-one' } }
            }
          )
        ).rejects.toThrow('Unable to find all testReferences to set on TestEntity');
      });
    });
  });

  describe('#setRelation', () => {
    it('call select and return the result', async () => {
      const entity = TEST_REFERENCES[0];
      const queryService = moduleRef.get(TestReferenceService);
      const queryResult = await queryService.setRelation('testEntity', entity._id, TEST_ENTITIES[1]._id);
      expect(queryResult).toEqual(expect.objectContaining({ ...entity, testEntity: TEST_ENTITIES[1]._id }));

      const relation = await queryService.findRelation(TestEntity, 'testEntity', entity);
      expect(convertDocument(relation)).toEqual(TEST_ENTITIES[1]);
    });

    it('should reject with a virtual reference', async () => {
      const entity = TEST_REFERENCES[0];
      const queryService = moduleRef.get(TestReferenceService);
      return expect(queryService.setRelation('virtualTestEntity', entity._id, TEST_ENTITIES[1]._id)).rejects.toThrow(
        'SetRelation not supported for virtual relation virtualTestEntity'
      );
    });

    describe('with modify options', () => {
      it('should throw an error if the entity is not found with the id and provided filter', async () => {
        const entity = TEST_REFERENCES[0];
        const queryService = moduleRef.get(TestReferenceService);
        return expect(
          queryService.setRelation('testEntity', entity._id, TEST_ENTITIES[1]._id, {
            filter: { referenceName: { eq: TEST_REFERENCES[1].referenceName } }
          })
        ).rejects.toThrow(`Unable to find TestReference with id: ${String(entity._id)}`);
      });

      it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
        const entity = TEST_REFERENCES[0];
        const queryService = moduleRef.get(TestReferenceService);
        return expect(
          queryService.setRelation<TestEntity>('testEntity', entity._id, TEST_ENTITIES[1]._id, {
            relationFilter: { stringType: { like: '%-one' } }
          })
        ).rejects.toThrow('Unable to find testEntity to set on TestReference');
      });
    });
  });

  describe('#removeRelations', () => {
    it('call select and return the result', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.removeRelations(
        'testReferences',
        entity._id,
        TEST_REFERENCES.slice(0, 3).map((r) => r._id)
      );
      expect(queryResult.toObject()).toEqual(
        expect.objectContaining({
          _id: entity._id,
          testReferences: []
        })
      );

      const relations = await queryService.queryRelations(TestReference, 'testReferences', entity, {});
      expect(relations).toHaveLength(0);
    });

    it('should not modify relations if relationIds is empty', async () => {
      const entity = TEST_ENTITIES[0];
      const queryService = moduleRef.get(TestEntityService);
      const queryResult = await queryService.removeRelations('testReferences', entity._id, []);
      expect(queryResult.toObject()).toEqual(
        expect.objectContaining({
          _id: entity._id,
          testReferences: expect.arrayContaining(TEST_REFERENCES.slice(0, 3).map((r) => r._id))
        })
      );

      const relations = await queryService.queryRelations(TestReference, 'testReferences', entity, {});
      expect(relations).toHaveLength(3);
    });

    describe('with virtual reference', () => {
      it('should return a rejected promise', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.removeRelations(
            'virtualTestReferences',
            entity._id,
            TEST_REFERENCES.slice(0, 3).map((r) => r._id)
          )
        ).rejects.toThrow('RemoveRelations not supported for virtual relation virtualTestReferences');
      });
    });

    describe('with modify options', () => {
      it('should throw an error if the entity is not found with the id and provided filter', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.removeRelations(
            'testReferences',
            entity._id,
            TEST_REFERENCES.slice(0, 3).map((r) => r._id),
            {
              filter: { stringType: { eq: TEST_ENTITIES[1].stringType } }
            }
          )
        ).rejects.toThrow(`Unable to find TestEntity with id: ${String(entity._id)}`);
      });

      it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
        const entity = TEST_ENTITIES[0];
        const queryService = moduleRef.get(TestEntityService);
        return expect(
          queryService.removeRelations<TestReference>(
            'testReferences',
            entity._id,
            TEST_REFERENCES.slice(0, 3).map((r) => r._id),
            {
              relationFilter: { referenceName: { like: '%-one' } }
            }
          )
        ).rejects.toThrow('Unable to find all testReferences to remove from TestEntity');
      });
    });
  });

  describe('#removeRelation', () => {
    it('call select and return the result', async () => {
      const entity = TEST_REFERENCES[0];
      const queryService = moduleRef.get(TestReferenceService);
      const queryResult = await queryService.removeRelation('testEntity', entity._id, TEST_ENTITIES[1]._id);
      expect(queryResult).toEqual(expect.objectContaining({ ...entity, testEntity: undefined }));

      const relation = await queryService.findRelation(TestEntity, 'testEntity', entity);
      expect(relation).toBeUndefined();
    });

    it('should reject with a virtual reference', async () => {
      const entity = TEST_REFERENCES[0];
      const queryService = moduleRef.get(TestReferenceService);
      return expect(queryService.removeRelation('virtualTestEntity', entity._id, TEST_ENTITIES[1]._id)).rejects.toThrow(
        'RemoveRelation not supported for virtual relation virtualTestEntity'
      );
    });

    describe('with modify options', () => {
      it('should throw an error if the entity is not found with the id and provided filter', async () => {
        const entity = TEST_REFERENCES[0];
        const queryService = moduleRef.get(TestReferenceService);
        return expect(
          queryService.removeRelation('testEntity', entity._id, TEST_ENTITIES[1]._id, {
            filter: { referenceName: { eq: TEST_REFERENCES[1].referenceName } }
          })
        ).rejects.toThrow(`Unable to find TestReference with id: ${String(entity._id)}`);
      });

      it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
        const entity = TEST_REFERENCES[0];
        const queryService = moduleRef.get(TestReferenceService);
        return expect(
          queryService.removeRelation<TestEntity>('testEntity', entity._id, TEST_ENTITIES[1]._id, {
            relationFilter: { stringType: { like: '%-one' } }
          })
        ).rejects.toThrow('Unable to find testEntity to remove from TestReference');
      });
    });
  });
});
