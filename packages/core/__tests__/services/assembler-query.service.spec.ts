import { mock, instance, objectContaining, when, deepEqual } from 'ts-mockito';
import { AbstractAssembler, AssemblerQueryService, Query, QueryService, transformQuery } from '../../src';

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

    convertQuery(query: Query<TestDTO>): Query<TestEntity> {
      return transformQuery(query, {
        foo: 'bar',
      });
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

      return expect(assemblerService.count({ foo: { eq: 'bar' } })).resolves.toEqual(1);
    });
  });

  describe('findById', () => {
    it('should transform the results', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.findById(1)).thenResolve({ bar: 'bar' });

      return expect(assemblerService.findById(1)).resolves.toEqual({ foo: 'bar' });
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
      ).thenCall((relationClass, relation, entities) => {
        return Promise.resolve(
          new Map<TestEntity, TestDTO[]>([[entities[0], [result]]]),
        );
      });
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
      ).resolves.toEqual(1);
    });

    it('should transform multiple entities', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      const dto: TestDTO = { foo: 'bar' };
      const entity: TestEntity = { bar: 'bar' };
      when(
        mockQueryService.countRelations(TestDTO, 'test', deepEqual([entity]), objectContaining({ foo: { eq: 'bar' } })),
      ).thenCall((relationClass, relation, entities) => {
        return Promise.resolve(
          new Map<TestEntity, number>([[entities[0], 1]]),
        );
      });
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
      when(mockQueryService.findRelation(TestDTO, 'test', deepEqual([entity]))).thenCall(
        (relationClass, relation, entities) => {
          return Promise.resolve(
            new Map<TestEntity, TestDTO>([[entities[0], result]]),
          );
        },
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
      when(mockQueryService.addRelations('test', 1, deepEqual([2, 3, 4]))).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.addRelations('test', 1, [2, 3, 4])).resolves.toEqual({ foo: 'baz' });
    });
  });
  describe('setRelation', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.setRelation('test', 1, 2)).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.setRelation('test', 1, 2)).resolves.toEqual({ foo: 'baz' });
    });
  });

  describe('removeRelations', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.removeRelations('test', 1, deepEqual([2, 3, 4]))).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.removeRelations('test', 1, [2, 3, 4])).resolves.toEqual({ foo: 'baz' });
    });
  });
  describe('removeRelation', () => {
    it('should transform the results for a single entity', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.removeRelation('test', 1, 2)).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.removeRelation('test', 1, 2)).resolves.toEqual({ foo: 'baz' });
    });
  });

  describe('getById', () => {
    it('should transform the results', () => {
      const mockQueryService = mock<QueryService<TestEntity>>();
      const assemblerService = new AssemblerQueryService(new TestAssembler(), instance(mockQueryService));
      when(mockQueryService.getById(1)).thenResolve({ bar: 'bar' });

      return expect(assemblerService.getById(1)).resolves.toEqual({ foo: 'bar' });
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
      when(mockQueryService.updateOne(1, objectContaining({ bar: 'baz' }))).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.updateOne(1, { foo: 'baz' })).resolves.toEqual({ foo: 'baz' });
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
      when(mockQueryService.deleteOne(1)).thenResolve({
        bar: 'baz',
      });

      return expect(assemblerService.deleteOne(1)).resolves.toEqual({ foo: 'baz' });
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
