import { mock, instance, objectContaining, when, deepEqual } from 'ts-mockito';
import {
  AbstractAssembler,
  AggregateQuery,
  AggregateResponse,
  AssemblerQueryService,
  DeepPartial,
  Query,
  QueryService,
  transformAggregateQuery,
  transformAggregateResponse,
  transformQuery,
} from '../../src';

describe('AssemblerQueryService', () => {
  class TestDTO {
    foo!: string;
  }

  class TestEntity {
    bar!: string;
  }

  class TestAssembler extends AbstractAssembler<TestDTO, TestEntity> {
    constructor() {
      super(TestDTO, TestEntity);
    }

    convertToDTO(entity: TestEntity): TestDTO {
      return {
        foo: entity.bar,
      };
    }

    convertToEntity(dto: TestDTO): TestEntity {
      return {
        bar: dto.foo,
      };
    }

    convertQuery(query: Query<TestDTO>): Query<TestEntity> {
      return transformQuery(query, {
        foo: 'bar',
      });
    }

    convertAggregateQuery(aggregate: AggregateQuery<TestDTO>): AggregateQuery<TestEntity> {
      return transformAggregateQuery(aggregate, {
        foo: 'bar',
      });
    }

    convertAggregateResponse(aggregate: AggregateResponse<TestEntity>): AggregateResponse<TestDTO> {
      return transformAggregateResponse(aggregate, {
        bar: 'foo',
      });
    }

    convertToCreateEntity(create: DeepPartial<TestDTO>): DeepPartial<TestEntity> {
      return { bar: create.foo };
    }

    convertToUpdateEntity(update: DeepPartial<TestDTO>): DeepPartial<TestEntity> {
      return { bar: update.foo };
    }
  }

  describe('query', () => {
    it('transform the query and results', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.query(objectContaining({ filter: { bar: { eq: 'bar' } } }))).thenResolve([{ bar: 'bar' }]);

      return expect(assemblerService.query({ filter: { foo: { eq: 'bar' } } })).resolves.toEqual([{ foo: 'bar' }]);
    });
  });

  describe('count', () => {
    it('transform the filter and results', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.count(objectContaining({ bar: { eq: 'bar' } }))).thenResolve(1);

      return expect(assemblerService.count({ foo: { eq: 'bar' } })).resolves.toBe(1);
    });
  });

  describe('findById', () => {
    it('should transform the results', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.findById(1, undefined)).thenResolve({ bar: 'bar' });

      return expect(assemblerService.findById(1)).resolves.toEqual({ foo: 'bar' });
    });

    it('should transform a filter if provided', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.findById(1, objectContaining({ filter: { bar: { eq: 'bar' } } }))).thenResolve({
        bar: 'bar',
      });

      return expect(assemblerService.findById(1, { filter: { foo: { eq: 'bar' } } })).resolves.toEqual({ foo: 'bar' });
    });

    it('should not transform the results if undefined', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.findById(1)).thenResolve(undefined);

      return expect(assemblerService.findById(1)).resolves.toBeUndefined();
    });
  });

  describe('queryRelations', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(
        mockQueryService.queryRelations(
          TestDTO,
          'test',
          objectContaining({ bar: 'bar' }),
          objectContaining({ filter: { foo: { eq: 'bar' } } }),
        ),
      ).thenResolve([{ foo: 'bar' }]);

      return expect(
        assemblerService.queryRelations(TestDTO, 'test', { foo: 'bar' }, { filter: { foo: { eq: 'bar' } } }),
      ).resolves.toEqual([{ foo: 'bar' }]);
    });

    it('should transform the results for multiple entities', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      const dto: TestDTO = { foo: 'bar' };
      const entity: TestEntity = { bar: 'bar' };
      const result: TestDTO = { foo: 'baz' };
      when(
        mockQueryService.queryRelations(
          TestDTO,
          'test',
          deepEqual([entity]),
          objectContaining({ filter: { foo: { eq: 'bar' } } }),
        ),
      ).thenCall((relationClass, relation, entities) =>
        Promise.resolve(new Map<TestEntity, TestDTO[]>([[entities[0], [result]]])),
      );
      return expect(
        assemblerService.queryRelations(TestDTO, 'test', [{ foo: 'bar' }], { filter: { foo: { eq: 'bar' } } }),
      ).resolves.toEqual(new Map([[dto, [result]]]));
    });

    it('should return an empty array for dtos with no relations', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      const dto: TestDTO = { foo: 'bar' };
      const entity: TestEntity = { bar: 'bar' };
      when(
        mockQueryService.queryRelations(
          TestDTO,
          'test',
          deepEqual([entity]),
          objectContaining({ filter: { foo: { eq: 'bar' } } }),
        ),
      ).thenResolve(new Map<TestEntity, TestDTO[]>());
      return expect(
        assemblerService.queryRelations(TestDTO, 'test', [{ foo: 'bar' }], { filter: { foo: { eq: 'bar' } } }),
      ).resolves.toEqual(new Map([[dto, []]]));
    });
  });

  describe('aggregateRelations', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      const aggQuery: AggregateQuery<TestDTO> = { count: ['foo'] };
      const result: AggregateResponse<TestDTO>[] = [{ count: { foo: 1 } }];
      when(
        mockQueryService.aggregateRelations(
          TestDTO,
          'test',
          objectContaining({ bar: 'bar' }),
          objectContaining({ foo: { eq: 'bar' } }),
          aggQuery,
        ),
      ).thenResolve(result);

      return expect(
        assemblerService.aggregateRelations(TestDTO, 'test', { foo: 'bar' }, { foo: { eq: 'bar' } }, aggQuery),
      ).resolves.toEqual(result);
    });

    it('should transform the results for multiple entities', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      const dto: TestDTO = { foo: 'bar' };
      const entity: TestEntity = { bar: 'bar' };
      const aggQuery: AggregateQuery<TestDTO> = { count: ['foo'] };
      const result: AggregateResponse<TestDTO> = { count: { foo: 1 } };
      when(
        mockQueryService.aggregateRelations(
          TestDTO,
          'test',
          deepEqual([entity]),
          objectContaining({ foo: { eq: 'bar' } }),
          aggQuery,
        ),
      ).thenCall((relationClass, relation, entities) =>
        Promise.resolve(new Map<TestEntity, AggregateResponse<TestDTO>>([[entities[0], result]])),
      );
      return expect(
        assemblerService.aggregateRelations(TestDTO, 'test', [{ foo: 'bar' }], { foo: { eq: 'bar' } }, aggQuery),
      ).resolves.toEqual(new Map([[dto, result]]));
    });

    it('should return an empty array for dtos with no aggregateRelations', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      const dto: TestDTO = { foo: 'bar' };
      const entity: TestEntity = { bar: 'bar' };
      const aggQuery: AggregateQuery<TestDTO> = { count: ['foo'] };
      when(
        mockQueryService.aggregateRelations(
          TestDTO,
          'test',
          deepEqual([entity]),
          objectContaining({ foo: { eq: 'bar' } }),
          aggQuery,
        ),
      ).thenResolve(new Map<TestEntity, AggregateResponse<TestDTO>[]>());
      return expect(
        assemblerService.aggregateRelations(TestDTO, 'test', [{ foo: 'bar' }], { foo: { eq: 'bar' } }, aggQuery),
      ).resolves.toEqual(new Map([[dto, []]]));
    });
  });

  describe('countRelations', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(
        mockQueryService.countRelations(
          TestDTO,
          'test',
          objectContaining({ bar: 'bar' }),
          objectContaining({ foo: { eq: 'bar' } }),
        ),
      ).thenResolve(1);

      return expect(
        assemblerService.countRelations(TestDTO, 'test', { foo: 'bar' }, { foo: { eq: 'bar' } }),
      ).resolves.toBe(1);
    });

    it('should transform multiple entities', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      const dto: TestDTO = { foo: 'bar' };
      const entity: TestEntity = { bar: 'bar' };
      when(
        mockQueryService.countRelations(TestDTO, 'test', deepEqual([entity]), objectContaining({ foo: { eq: 'bar' } })),
      ).thenCall((relationClass, relation, entities) =>
        Promise.resolve(new Map<TestEntity, number>([[entities[0], 1]])),
      );
      return expect(
        assemblerService.countRelations(TestDTO, 'test', [{ foo: 'bar' }], { foo: { eq: 'bar' } }),
      ).resolves.toEqual(new Map([[dto, 1]]));
    });
  });

  describe('findRelation', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.findRelation(TestDTO, 'test', objectContaining({ bar: 'bar' }))).thenResolve({
        foo: 'bar',
      });

      return expect(assemblerService.findRelation(TestDTO, 'test', { foo: 'bar' })).resolves.toEqual({ foo: 'bar' });
    });

    it('should transform the results for multiple entities', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      const dto: TestDTO = { foo: 'bar' };
      const entity: TestEntity = { bar: 'bar' };
      const result: TestDTO = { foo: 'baz' };
      when(mockQueryService.findRelation(TestDTO, 'test', deepEqual([entity]), undefined)).thenCall(
        (relationClass, relation, entities) => Promise.resolve(new Map<TestEntity, TestDTO>([[entities[0], result]])),
      );
      return expect(assemblerService.findRelation(TestDTO, 'test', [{ foo: 'bar' }])).resolves.toEqual(
        new Map([[dto, result]]),
      );
    });
  });

  describe('addRelations', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.addRelations('test', 1, deepEqual([2, 3, 4]), undefined)).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.addRelations('test', 1, [2, 3, 4])).resolves.toEqual({ foo: 'baz' });
    });

    it('should transform the filter and results for a single entity', async () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(
        mockQueryService.addRelations(
          'test',
          1,
          deepEqual([2, 3, 4]),
          objectContaining({ filter: { bar: { eq: 'bar' } } }),
        ),
      ).thenResolve({
        bar: 'baz',
      });
      const addResult = await assemblerService.addRelations('test', 1, [2, 3, 4], {
        filter: { foo: { eq: 'bar' } },
      });
      return expect(addResult).toEqual({ foo: 'baz' });
    });
  });
  describe('setRelation', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.setRelation('test', 1, 2, undefined)).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.setRelation('test', 1, 2)).resolves.toEqual({ foo: 'baz' });
    });
    it('should transform the options and results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(
        mockQueryService.setRelation('test', 1, 2, objectContaining({ filter: { bar: { eq: 'bar' } } })),
      ).thenResolve({
        bar: 'baz',
      });

      return expect(
        assemblerService.setRelation('test', 1, 2, {
          filter: { foo: { eq: 'bar' } },
        }),
      ).resolves.toEqual({ foo: 'baz' });
    });
  });

  describe('setRelations', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.setRelations('test', 1, deepEqual([2]), undefined)).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.setRelations('test', 1, [2])).resolves.toEqual({ foo: 'baz' });
    });
    it('should transform the options and results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(
        mockQueryService.setRelations('test', 1, deepEqual([2]), objectContaining({ filter: { bar: { eq: 'bar' } } })),
      ).thenResolve({
        bar: 'baz',
      });

      return expect(
        assemblerService.setRelations('test', 1, [2], {
          filter: { foo: { eq: 'bar' } },
        }),
      ).resolves.toEqual({ foo: 'baz' });
    });
  });

  describe('removeRelations', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.removeRelations('test', 1, deepEqual([2, 3, 4]), undefined)).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.removeRelations('test', 1, [2, 3, 4])).resolves.toEqual({ foo: 'baz' });
    });

    it('should transform the options and results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(
        mockQueryService.removeRelations(
          'test',
          1,
          deepEqual([2, 3, 4]),
          objectContaining({ filter: { bar: { eq: 'bar' } } }),
        ),
      ).thenResolve({
        bar: 'baz',
      });

      return expect(
        assemblerService.removeRelations('test', 1, [2, 3, 4], {
          filter: { foo: { eq: 'bar' } },
        }),
      ).resolves.toEqual({ foo: 'baz' });
    });
  });
  describe('removeRelation', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.removeRelation('test', 1, 2, undefined)).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.removeRelation('test', 1, 2)).resolves.toEqual({ foo: 'baz' });
    });
    it('should transform the options and results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(
        mockQueryService.removeRelation('test', 1, 2, objectContaining({ filter: { bar: { eq: 'bar' } } })),
      ).thenResolve({
        bar: 'baz',
      });

      return expect(
        assemblerService.removeRelation('test', 1, 2, {
          filter: { foo: { eq: 'bar' } },
        }),
      ).resolves.toEqual({ foo: 'baz' });
    });
  });

  describe('getById', () => {
    it('should transform the results', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.getById(1, undefined)).thenResolve({ bar: 'bar' });

      return expect(assemblerService.getById(1)).resolves.toEqual({ foo: 'bar' });
    });

    it('should transform the filter and results', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.getById(1, deepEqual({ filter: { bar: { eq: 'bar' } } }))).thenResolve({
        bar: 'bar',
      });

      return expect(assemblerService.getById(1, { filter: { foo: { eq: 'bar' } } })).resolves.toEqual({ foo: 'bar' });
    });
  });

  describe('createOne', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.createOne(objectContaining({ bar: 'baz' }))).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.createOne({ foo: 'baz' })).resolves.toEqual({ foo: 'baz' });
    });
  });

  describe('createMany', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.createMany(deepEqual([{ bar: 'baz' }]))).thenResolve([{ bar: 'baz' }]);

      return expect(assemblerService.createMany([{ foo: 'baz' }])).resolves.toEqual([{ foo: 'baz' }]);
    });
  });

  describe('updateOne', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.updateOne(1, objectContaining({ bar: 'baz' }), undefined)).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.updateOne(1, { foo: 'baz' })).resolves.toEqual({ foo: 'baz' });
    });

    it('should transform the filter and results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(
        mockQueryService.updateOne(
          1,
          objectContaining({ bar: 'baz' }),
          objectContaining({ filter: { bar: { eq: 'bar' } } }),
        ),
      ).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.updateOne(1, { foo: 'baz' }, { filter: { foo: { eq: 'bar' } } })).resolves.toEqual(
        {
          foo: 'baz',
        },
      );
    });
  });

  describe('updateMany', () => {
    it('should transform the arguments', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(
        mockQueryService.updateMany(objectContaining({ bar: 'baz' }), objectContaining({ bar: { eq: 'bar' } })),
      ).thenResolve({ updatedCount: 1 });

      return expect(assemblerService.updateMany({ foo: 'baz' }, { foo: { eq: 'bar' } })).resolves.toEqual({
        updatedCount: 1,
      });
    });
  });

  describe('deleteOne', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.deleteOne(1, undefined)).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.deleteOne(1)).resolves.toEqual({ foo: 'baz' });
    });

    it('should transform the filter and results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.deleteOne(1, objectContaining({ filter: { bar: { eq: 'bar' } } }))).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.deleteOne(1, { filter: { foo: { eq: 'bar' } } })).resolves.toEqual({ foo: 'baz' });
    });
  });

  describe('deleteMany', () => {
    it('should transform the arguments', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.deleteMany(objectContaining({ bar: { eq: 'bar' } }))).thenResolve({ deletedCount: 1 });

      return expect(assemblerService.deleteMany({ foo: { eq: 'bar' } })).resolves.toEqual({
        deletedCount: 1,
      });
    });
  });
});
