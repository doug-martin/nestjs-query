import { mock, reset, instance, when, deepEqual } from 'ts-mockito';
import { AggregateQuery, QueryService, RelationQueryService } from '../../src';

describe('RelationQueryService', () => {
  const mockQueryService: QueryService<TestType> = mock<QueryService<TestType>>();
  const mockRelationService: QueryService<TestType> = mock<QueryService<TestType>>();
  const testRelationFn = jest.fn();

  class TestType {
    foo!: string;
  }

  const relations = {
    test: { service: instance(mockRelationService), query: testRelationFn },
  };

  afterEach(() => {
    reset(mockQueryService);
    reset(mockRelationService);
    jest.clearAllMocks();
  });

  const queryService: QueryService<TestType> = new RelationQueryService(instance(mockQueryService), relations);

  it('should set the underlying service to a NoOpQueryService if called without a query service', () =>
    expect(new RelationQueryService(relations).query({})).rejects.toThrow('query is not implemented'));

  describe('#addRelations', () => {
    it('should proxy to the underlying service when calling addRelations', () => {
      const relationName = 'test';
      const id = 1;
      const relationIds = [1, 2, 3];
      const result = { foo: 'bar' };
      when(mockQueryService.addRelations(relationName, id, relationIds, undefined)).thenResolve(result);
      return expect(queryService.addRelations(relationName, id, relationIds, undefined)).resolves.toBe(result);
    });
  });

  describe('#findRelation', () => {
    it('should proxy to the underlying service when calling findRelation with one dto', async () => {
      const relationName = 'test';
      const dto = new TestType();
      const result = { foo: 'bar' };
      const query = { filter: { foo: { eq: 'bar' } } };
      testRelationFn.mockReturnValue(query);
      when(mockRelationService.query(deepEqual({ ...query, paging: { limit: 1 } }))).thenResolve([result]);
      const findResult = await queryService.findRelation(TestType, relationName, dto);
      expect(findResult).toBe(result);
      return expect(testRelationFn).toHaveBeenCalledWith(dto);
    });

    it('should call the relationService findRelation with multiple dtos', async () => {
      const relationName = 'test';
      const dtos = [new TestType()];
      const query = { filter: { foo: { eq: 'bar' } } };
      testRelationFn.mockReturnValue(query);
      const resultRelations = [{ foo: 'baz' }];
      const result = new Map([[dtos[0], resultRelations[0]]]);
      when(mockRelationService.query(deepEqual({ ...query, paging: { limit: 1 } }))).thenResolve(resultRelations);
      await expect(queryService.findRelation(TestType, relationName, dtos, undefined)).resolves.toEqual(result);
      return expect(testRelationFn).toHaveBeenCalledWith(dtos[0]);
    });

    it('should call the original service if the relation is not in this relation query service', async () => {
      const relationName = 'otherRelation';
      const dto = new TestType();
      const result = { foo: 'baz' };
      when(mockQueryService.findRelation(TestType, relationName, dto, undefined)).thenResolve(result);
      await expect(queryService.findRelation(TestType, relationName, dto, undefined)).resolves.toEqual(result);
      return expect(testRelationFn).not.toHaveBeenCalled();
    });

    it('should call the original service if the relation is not in this relation query service with multiple DTOs', async () => {
      const relationName = 'otherRelation';
      const dtos = [new TestType()];
      const result = new Map([[dtos[0], { foo: 'baz' }]]);
      when(mockQueryService.findRelation(TestType, relationName, dtos, undefined)).thenResolve(result);
      await expect(queryService.findRelation(TestType, relationName, dtos)).resolves.toEqual(result);
      return expect(testRelationFn).not.toHaveBeenCalled();
    });
  });

  describe('#queryRelations', () => {
    it('should proxy to the underlying service when calling queryRelations with one dto', async () => {
      const relationName = 'test';
      const dto = new TestType();
      const result = [{ foo: 'bar' }];
      const query = {};
      const relationQuery = {};
      testRelationFn.mockReturnValue(relationQuery);
      when(mockRelationService.query(deepEqual({ ...relationQuery }))).thenResolve(result);
      await expect(queryService.queryRelations(TestType, relationName, dto, query)).resolves.toBe(result);
      return expect(testRelationFn).toHaveBeenCalledWith(dto);
    });

    it('should proxy to the underlying service when calling queryRelations with many dtos', () => {
      const relationName = 'test';
      const dtos = [new TestType()];
      const query = {};
      const relationQuery = {};
      const relationResult: TestType[] = [];
      const result = new Map([[dtos[0], relationResult]]);
      testRelationFn.mockReturnValue(relationQuery);
      when(mockRelationService.query(deepEqual({ ...relationQuery }))).thenResolve(relationResult);
      return expect(queryService.queryRelations(TestType, relationName, dtos, query)).resolves.toEqual(result);
    });

    it('should proxy to the underlying service when calling queryRelations with one dto and a unknown relation', () => {
      const relationName = 'unknown';
      const dto = new TestType();
      const query = {};
      const result = [{ foo: 'bar' }];
      when(mockQueryService.queryRelations(TestType, relationName, dto, query)).thenResolve(result);
      return expect(queryService.queryRelations(TestType, relationName, dto, query)).resolves.toBe(result);
    });

    it('should proxy to the underlying service when calling queryRelations with many dtos and a unknown relation', () => {
      const relationName = 'unknown';
      const dtos = [new TestType()];
      const query = {};
      const result = new Map([[{ foo: 'bar' }, []]]);
      when(mockQueryService.queryRelations(TestType, relationName, dtos, query)).thenResolve(result);
      return expect(queryService.queryRelations(TestType, relationName, dtos, query)).resolves.toBe(result);
    });
  });

  describe('#aggregateRelations', () => {
    it('should proxy to the underlying service when calling queryRelations with one dto', async () => {
      const relationName = 'test';
      const dto = new TestType();
      const result = [{ count: { foo: 1 } }];
      const filter = {};
      const relationFilter = {};
      const relationAggregateQuery: AggregateQuery<TestType> = { count: ['foo'] };
      testRelationFn.mockReturnValue({ filter: relationFilter });
      when(mockRelationService.aggregate(deepEqual(relationFilter), relationAggregateQuery)).thenResolve(result);
      await expect(
        queryService.aggregateRelations(TestType, relationName, dto, filter, relationAggregateQuery),
      ).resolves.toBe(result);
      return expect(testRelationFn).toHaveBeenCalledWith(dto);
    });

    it('should proxy to the underlying service when calling queryRelations with many dtos', async () => {
      const relationName = 'test';
      const dtos = [new TestType()];
      const relationResults = [{ count: { foo: 1 } }];
      const result = new Map([[dtos[0], relationResults]]);
      const filter = {};
      const relationFilter = {};
      const relationAggregateQuery: AggregateQuery<TestType> = { count: ['foo'] };
      testRelationFn.mockReturnValue({ filter: relationFilter });
      when(mockRelationService.aggregate(deepEqual(relationFilter), relationAggregateQuery)).thenResolve(
        relationResults,
      );
      return expect(
        queryService.aggregateRelations(TestType, relationName, dtos, filter, relationAggregateQuery),
      ).resolves.toEqual(result);
    });

    it('should proxy to the underlying service when calling queryRelations with one dto and a unknown relation', () => {
      const relationName = 'unknown';
      const dto = new TestType();
      const filter = {};
      const aggregateQuery: AggregateQuery<TestType> = { count: ['foo'] };
      const result = [{ count: { foo: 1 } }];
      when(mockQueryService.aggregateRelations(TestType, relationName, dto, filter, aggregateQuery)).thenResolve(
        result,
      );
      return expect(queryService.aggregateRelations(TestType, relationName, dto, filter, aggregateQuery)).resolves.toBe(
        result,
      );
    });

    it('should proxy to the underlying service when calling queryRelations with many dtos and a unknown relation', () => {
      const relationName = 'unknown';
      const dtos = [new TestType()];
      const filter = {};
      const aggregateQuery: AggregateQuery<TestType> = { count: ['foo'] };
      const result = new Map([[dtos[0], [{ count: { foo: 1 } }]]]);
      when(mockQueryService.aggregateRelations(TestType, relationName, dtos, filter, aggregateQuery)).thenResolve(
        result,
      );
      return expect(
        queryService.aggregateRelations(TestType, relationName, dtos, filter, aggregateQuery),
      ).resolves.toBe(result);
    });
  });

  describe('#countRelations', () => {
    it('should proxy to the underlying service when calling queryRelations with one dto', async () => {
      const relationName = 'test';
      const dto = new TestType();
      const result = 1;
      const query = {};
      const relationQuery = {};
      testRelationFn.mockReturnValue(relationQuery);
      when(mockRelationService.count(deepEqual({ ...relationQuery }))).thenResolve(result);
      await expect(queryService.countRelations(TestType, relationName, dto, query)).resolves.toBe(result);
      return expect(testRelationFn).toHaveBeenCalledWith(dto);
    });

    it('should proxy to the underlying service when calling queryRelations with many dtos', () => {
      const relationName = 'test';
      const dtos = [new TestType()];
      const query = {};
      const relationQuery = {};
      const relationResult = 1;
      const result = new Map([[dtos[0], relationResult]]);
      testRelationFn.mockReturnValue(relationQuery);
      when(mockRelationService.count(deepEqual({ ...relationQuery }))).thenResolve(relationResult);
      return expect(queryService.countRelations(TestType, relationName, dtos, query)).resolves.toEqual(result);
    });

    it('should proxy to the underlying service when calling queryRelations with one dto and a unknown relation', () => {
      const relationName = 'unknown';
      const dto = new TestType();
      const query = {};
      const result = 1;
      when(mockQueryService.countRelations(TestType, relationName, dto, query)).thenResolve(result);
      return expect(queryService.countRelations(TestType, relationName, dto, query)).resolves.toBe(result);
    });

    it('should proxy to the underlying service when calling queryRelations with many dtos and a unknown relation', () => {
      const relationName = 'unknown';
      const dtos = [new TestType()];
      const query = {};
      const result = new Map([[{ foo: 'bar' }, 1]]);
      when(mockQueryService.countRelations(TestType, relationName, dtos, query)).thenResolve(result);
      return expect(queryService.countRelations(TestType, relationName, dtos, query)).resolves.toBe(result);
    });
  });

  describe('#removeRelation', () => {
    it('should proxy to the underlying service when calling removeRelation', () => {
      const relationName = 'test';
      const id = 1;
      const relationId = 2;
      const result = { foo: 'bar' };
      when(mockQueryService.removeRelation(relationName, id, relationId, undefined)).thenResolve(result);
      return expect(queryService.removeRelation(relationName, id, relationId)).resolves.toBe(result);
    });
  });

  describe('#removeRelations', () => {
    it('should proxy to the underlying service when calling removeRelations', () => {
      const relationName = 'test';
      const id = 1;
      const relationIds = [2];
      const result = { foo: 'bar' };
      when(mockQueryService.removeRelations(relationName, id, relationIds, undefined)).thenResolve(result);
      return expect(queryService.removeRelations(relationName, id, relationIds)).resolves.toBe(result);
    });
  });
  describe('#setRelation', () => {
    it('should proxy to the underlying service when calling setRelation', () => {
      const relationName = 'test';
      const id = 1;
      const relationId = 2;
      const result = { foo: 'bar' };
      when(mockQueryService.setRelation(relationName, id, relationId, undefined)).thenResolve(result);
      return expect(queryService.setRelation(relationName, id, relationId)).resolves.toBe(result);
    });
  });
  describe('#setRelations', () => {
    it('should proxy to the underlying service when calling setRelations', () => {
      const relationName = 'test';
      const id = 1;
      const relationIds = [2];
      const result = { foo: 'bar' };
      when(mockQueryService.setRelations(relationName, id, relationIds, undefined)).thenResolve(result);
      return expect(queryService.setRelations(relationName, id, relationIds)).resolves.toBe(result);
    });
  });
});
