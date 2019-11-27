// eslint-disable-next-line max-classes-per-file
import 'reflect-metadata';
import * as nestGraphql from '@nestjs/graphql';
import {
  AbstractQueryService,
  CreateOne,
  CreateMany,
  UpdateOne,
  UpdateMany,
  UpdateManyResponse,
  DeleteOne,
  DeleteMany,
  DeleteManyResponse,
} from '@nestjs-query/core';
import { ID, ObjectType } from 'type-graphql';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { instance, mock, when } from 'ts-mockito';
import * as typeFactories from './type-factories';
import * as decorators from '../decorators';
import { GraphQLQueryResolver, QueryMethodOptions } from './abstract-graphql-query.resolver';
import { AdvancedOptions, ReturnTypeFuncValue } from '../external/type-graphql.types';
import { DeleteManyResponseType, GraphQLQueryType, UpdateManyResponseType } from '../types';

describe('GraphQLQueryResolver', () => {
  const createResolverTypesFactorySpy = jest.spyOn(typeFactories, 'createResolverTypesFactory');
  const deleteResolverTypesFactorySpy = jest.spyOn(typeFactories, 'deleteResolverTypesFactory');
  const readResolverTypesFactorySpy = jest.spyOn(typeFactories, 'readResolverTypesFactory');
  const updateResolverTypesFactorySpy = jest.spyOn(typeFactories, 'updateResolverTypesFactory');
  const resolverQuerySpy = jest.spyOn(decorators, 'ResolverQuery');
  const resolverMutationSpy = jest.spyOn(decorators, 'ResolverMutation');
  const argsSpy = jest.spyOn(nestGraphql, 'Args');

  beforeEach(() => jest.clearAllMocks());

  @ObjectType()
  class TestResolverDTO {
    @decorators.FilterableField(() => ID)
    id!: string;

    @decorators.FilterableField()
    stringField!: string;
  }

  class FakeCanActivate implements CanActivate {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    canActivate(context: ExecutionContext): boolean {
      return false;
    }
  }

  class TestResolver extends GraphQLQueryResolver(TestResolverDTO) {
    constructor(service: AbstractQueryService<TestResolverDTO>) {
      super(service);
    }
  }

  function assertResolverQueryCall(
    callNo: number,
    returnType: ReturnTypeFuncValue,
    advancedOpts: AdvancedOptions,
    ...opts: decorators.ResolverMethodOptions[]
  ) {
    const [rt, ao, ...rest] = resolverQuerySpy.mock.calls[callNo]!;
    expect(rt()).toEqual(returnType);
    expect(ao).toEqual(advancedOpts);
    expect(rest).toEqual(opts);
  }

  function assertResolverMutationCall(
    callNo: number,
    returnType: ReturnTypeFuncValue,
    advancedOpts: AdvancedOptions,
    ...opts: decorators.ResolverMethodOptions[]
  ) {
    const [rt, ao, ...rest] = resolverMutationSpy.mock.calls[callNo]!;
    expect(rt()).toEqual(returnType);
    expect(ao).toEqual(advancedOpts);
    expect(rest).toEqual(opts);
  }

  function assertArgsCall(callNo: number, expectedOpts: nestGraphql.ArgsOptions) {
    const opts = argsSpy.mock.calls[callNo][0];
    expect(opts.type!()).toEqual(expectedOpts.type!());
    expect(opts.name).toEqual(expectedOpts.name);
  }

  it('should create an Abstract resolver for the DTO class', () => {
    GraphQLQueryResolver(TestResolverDTO);
    expect(createResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, {});
    const { CreateManyInputType, CreateOneInputType } = createResolverTypesFactorySpy.mock.results[0].value;

    expect(readResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, {});
    const { QueryType, ConnectionType } = readResolverTypesFactorySpy.mock.results[0].value;

    expect(deleteResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, { FilterType: QueryType.FilterType });
    const { DeleteType, DeleteOneInputType, DeleteManyInputType } = deleteResolverTypesFactorySpy.mock.results[0].value;
    expect(updateResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, { FilterType: QueryType.FilterType });
    const { UpdateOneInputType, UpdateManyInputType } = updateResolverTypesFactorySpy.mock.results[0].value;

    expect(resolverQuerySpy).toBeCalledTimes(1);
    assertResolverQueryCall(0, ConnectionType, { name: 'testResolverDTOS' }, {}, {});
    assertArgsCall(0, { type: () => QueryType });

    expect(resolverMutationSpy).toBeCalledTimes(6);
    assertResolverMutationCall(0, TestResolverDTO, { name: 'createOneTestResolverDTO' }, {}, {});
    assertArgsCall(1, { name: 'input', type: () => CreateOneInputType });

    assertResolverMutationCall(1, [TestResolverDTO], { name: 'createManyTestResolverDTOS' }, {}, {});
    assertArgsCall(2, { name: 'input', type: () => CreateManyInputType });

    assertResolverMutationCall(2, TestResolverDTO, { name: 'updateOneTestResolverDTO' }, {}, {});
    assertArgsCall(3, { name: 'input', type: () => UpdateOneInputType });

    assertResolverMutationCall(3, UpdateManyResponseType, { name: 'updateManyTestResolverDTOS' }, {}, {});
    assertArgsCall(4, { name: 'input', type: () => UpdateManyInputType });

    assertResolverMutationCall(4, DeleteType, { name: 'deleteOneTestResolverDTO' }, {}, {});
    assertArgsCall(5, { name: 'input', type: () => DeleteOneInputType });

    assertResolverMutationCall(5, DeleteManyResponseType, { name: 'deleteManyTestResolverDTOS' }, {}, {});
    assertArgsCall(6, { name: 'input', type: () => DeleteManyInputType });
  });

  describe('create methods', () => {
    it('should provide the create options to the createResolverTypesFactory', () => {
      class CreateType {
        stringField!: string;
      }

      const createOpts = {
        typeName: 'TestObj',
        CreateType: () => CreateType,
      };
      GraphQLQueryResolver(TestResolverDTO, createOpts);
      expect(createResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, createOpts);
      const { CreateManyInputType, CreateOneInputType } = createResolverTypesFactorySpy.mock.results[0].value;

      expect(resolverMutationSpy).toBeCalledTimes(6);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'createOneTestObj' }, {}, {});
      assertArgsCall(1, { name: 'input', type: () => CreateOneInputType });

      assertResolverMutationCall(1, [TestResolverDTO], { name: 'createManyTestObjs' }, {}, {});
      assertArgsCall(2, { name: 'input', type: () => CreateManyInputType });
    });

    describe('#createOne', () => {
      it('should provide the methods.queries and methods.createOne options to the createOne ResolverMethod decorator', () => {
        const mutationOpts: QueryMethodOptions = {
          disabled: false,
          filters: [],
          guards: [],
          interceptors: [],
          pipes: [],
        };
        const createOneOpts: QueryMethodOptions = {
          disabled: false,
          filters: [],
          guards: [FakeCanActivate],
          interceptors: [],
          pipes: [],
        };
        GraphQLQueryResolver(TestResolverDTO, {
          methods: {
            mutations: mutationOpts,
            createOne: createOneOpts,
          },
        });
        expect(createResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, {});
        const { CreateManyInputType, CreateOneInputType } = createResolverTypesFactorySpy.mock.results[0].value;

        expect(resolverMutationSpy).toBeCalledTimes(6);
        assertResolverMutationCall(
          0,
          TestResolverDTO,
          { name: 'createOneTestResolverDTO' },
          mutationOpts,
          createOneOpts,
        );
        assertArgsCall(1, { name: 'input', type: () => CreateOneInputType });

        assertResolverMutationCall(1, [TestResolverDTO], { name: 'createManyTestResolverDTOS' }, mutationOpts, {});
        assertArgsCall(2, { name: 'input', type: () => CreateManyInputType });
      });

      it('should call the service createOne with the provided input', async () => {
        const mockService = mock<AbstractQueryService<TestResolverDTO>>();
        const input: CreateOne<TestResolverDTO, Partial<TestResolverDTO>> = {
          item: {
            stringField: 'foo',
          },
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        const resolver = new TestResolver(instance(mockService));
        when(mockService.createOne(input)).thenResolve(output);
        const result = await resolver.createOne(input);
        return expect(result).toEqual(output);
      });
    });

    describe('#createMany', () => {
      it('should provide the methods.queries and methods.createMany options to the createMany ResolverMethod decorator', () => {
        const mutationOpts: QueryMethodOptions = {
          disabled: false,
          filters: [],
          guards: [FakeCanActivate],
          interceptors: [],
          pipes: [],
        };
        const createManyOpts: QueryMethodOptions = {
          disabled: false,
          filters: [],
          guards: [],
          interceptors: [],
          pipes: [],
        };
        GraphQLQueryResolver(TestResolverDTO, {
          methods: {
            mutations: mutationOpts,
            createMany: createManyOpts,
          },
        });
        expect(createResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, {});
        const { CreateManyInputType, CreateOneInputType } = createResolverTypesFactorySpy.mock.results[0].value;

        expect(resolverMutationSpy).toBeCalledTimes(6);
        assertResolverMutationCall(0, TestResolverDTO, { name: 'createOneTestResolverDTO' }, mutationOpts, {});
        assertArgsCall(1, { name: 'input', type: () => CreateOneInputType });

        assertResolverMutationCall(
          1,
          [TestResolverDTO],
          { name: 'createManyTestResolverDTOS' },
          mutationOpts,
          createManyOpts,
        );
        assertArgsCall(2, { name: 'input', type: () => CreateManyInputType });
      });

      it('should call the service createMany with the provided input', async () => {
        const mockService = mock<AbstractQueryService<TestResolverDTO>>();
        const input: CreateMany<TestResolverDTO, Partial<TestResolverDTO>> = {
          items: [
            {
              stringField: 'foo',
            },
          ],
        };
        const output: TestResolverDTO[] = [
          {
            id: 'id-1',
            stringField: 'foo',
          },
        ];
        const resolver = new TestResolver(instance(mockService));
        when(mockService.createMany(input)).thenResolve(output);
        const result = await resolver.createMany(input);
        return expect(result).toEqual(output);
      });
    });
  });

  describe('query methods', () => {
    it('should provide the read options to the readResolverTypesFactory', () => {
      const opts = {
        typeName: 'TestObj',
      };
      GraphQLQueryResolver(TestResolverDTO, opts);

      expect(readResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, opts);
      const { QueryType, ConnectionType } = readResolverTypesFactorySpy.mock.results[0].value;

      expect(resolverQuerySpy).toBeCalledTimes(1);
      assertResolverQueryCall(0, ConnectionType, { name: 'testObjs' }, {}, {});
      assertArgsCall(0, { type: () => QueryType });

      expect(resolverMutationSpy).toBeCalledTimes(6);
    });

    describe('#query', () => {
      it('should provide the methods.queries and methods.createOne options to the createOne ResolverMethod decorator', () => {
        const queriesOpts: QueryMethodOptions = {
          disabled: false,
          filters: [],
          guards: [],
          interceptors: [],
          pipes: [],
        };
        const queryOpts: QueryMethodOptions = {
          disabled: false,
          filters: [],
          guards: [FakeCanActivate],
          interceptors: [],
          pipes: [],
        };
        GraphQLQueryResolver(TestResolverDTO, {
          methods: {
            queries: queriesOpts,
            query: queryOpts,
          },
        });
        expect(readResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, {});
        const { QueryType, ConnectionType } = readResolverTypesFactorySpy.mock.results[0].value;

        expect(resolverQuerySpy).toBeCalledTimes(1);
        assertResolverQueryCall(0, ConnectionType, { name: 'testResolverDTOS' }, queriesOpts, queryOpts);
        assertArgsCall(0, { type: () => QueryType });
      });

      it('should call the service query with the provided input', async () => {
        const mockService = mock<AbstractQueryService<TestResolverDTO>>();
        const query: GraphQLQueryType<TestResolverDTO> = {
          filter: {
            stringField: { eq: 'foo' },
          },
        };
        const output: TestResolverDTO[] = [
          {
            id: 'id-1',
            stringField: 'foo',
          },
        ];
        const resolver = new TestResolver(instance(mockService));
        when(mockService.query(query)).thenResolve(output);
        const result = await resolver.query(query);
        const expected = await TestResolver.ConnectionType.create(Promise.resolve(output));
        return expect(result).toEqual(expected);
      });
    });
  });

  describe('update methods', () => {
    it('should provide the update options to the updateResolverTypesFactory', () => {
      class UpdateType {
        stringField!: string;
      }

      const opts = {
        typeName: 'TestObj',
        UpdateType: () => UpdateType,
      };
      GraphQLQueryResolver(TestResolverDTO, opts);

      expect(readResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, { typeName: opts.typeName });
      const { QueryType } = readResolverTypesFactorySpy.mock.results[0].value;

      expect(updateResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, {
        ...opts,
        FilterType: QueryType.FilterType,
      });
      const { UpdateOneInputType, UpdateManyInputType } = updateResolverTypesFactorySpy.mock.results[0].value;

      expect(resolverQuerySpy).toBeCalledTimes(1);
      expect(resolverMutationSpy).toBeCalledTimes(6);

      assertResolverMutationCall(2, TestResolverDTO, { name: 'updateOneTestObj' }, {}, {});
      assertArgsCall(3, { name: 'input', type: () => UpdateOneInputType });

      assertResolverMutationCall(3, UpdateManyResponseType, { name: 'updateManyTestObjs' }, {}, {});
      assertArgsCall(4, { name: 'input', type: () => UpdateManyInputType });
    });

    describe('#updateOne', () => {
      it('should provide the methods.queries and methods.updateOne options to the updateOne ResolverMethod decorator', () => {
        const mutationOpts: QueryMethodOptions = {
          disabled: false,
          filters: [],
          guards: [],
          interceptors: [],
          pipes: [],
        };
        const updateOneOpts: QueryMethodOptions = {
          disabled: false,
          filters: [],
          guards: [FakeCanActivate],
          interceptors: [],
          pipes: [],
        };
        GraphQLQueryResolver(TestResolverDTO, {
          methods: {
            mutations: mutationOpts,
            updateOne: updateOneOpts,
          },
        });
        expect(createResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, {});
        const { UpdateManyInputType, UpdateOneInputType } = updateResolverTypesFactorySpy.mock.results[0].value;

        expect(resolverMutationSpy).toBeCalledTimes(6);
        assertResolverMutationCall(
          2,
          TestResolverDTO,
          { name: 'updateOneTestResolverDTO' },
          mutationOpts,
          updateOneOpts,
        );
        assertArgsCall(3, { name: 'input', type: () => UpdateOneInputType });

        assertResolverMutationCall(3, UpdateManyResponseType, { name: 'updateManyTestResolverDTOS' }, mutationOpts, {});
        assertArgsCall(4, { name: 'input', type: () => UpdateManyInputType });
      });

      it('should call the service updateOne with the provided input', async () => {
        const mockService = mock<AbstractQueryService<TestResolverDTO>>();
        const input: UpdateOne<TestResolverDTO, Partial<TestResolverDTO>> = {
          id: 'id-1',
          update: {
            stringField: 'bar',
          },
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'bar',
        };
        const resolver = new TestResolver(instance(mockService));
        when(mockService.updateOne(input)).thenResolve(output);
        const result = await resolver.updateOne(input);
        return expect(result).toEqual(output);
      });
    });

    describe('#updateMany', () => {
      it('should provide the methods.queries and methods.updateMany options to the updateMany ResolverMethod decorator', () => {
        const mutationOpts: QueryMethodOptions = {
          disabled: false,
          filters: [],
          guards: [FakeCanActivate],
          interceptors: [],
          pipes: [],
        };
        const updateManyOpts: QueryMethodOptions = {
          disabled: false,
          filters: [],
          guards: [],
          interceptors: [],
          pipes: [],
        };
        GraphQLQueryResolver(TestResolverDTO, {
          methods: {
            mutations: mutationOpts,
            updateMany: updateManyOpts,
          },
        });
        expect(createResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, {});
        const { UpdateManyInputType, UpdateOneInputType } = updateResolverTypesFactorySpy.mock.results[0].value;

        expect(resolverMutationSpy).toBeCalledTimes(6);
        assertResolverMutationCall(2, TestResolverDTO, { name: 'updateOneTestResolverDTO' }, mutationOpts, {});
        assertArgsCall(3, { name: 'input', type: () => UpdateOneInputType });

        assertResolverMutationCall(
          3,
          UpdateManyResponseType,
          { name: 'updateManyTestResolverDTOS' },
          mutationOpts,
          updateManyOpts,
        );
        assertArgsCall(4, { name: 'input', type: () => UpdateManyInputType });
      });

      it('should call the service updateMany with the provided input', async () => {
        const mockService = mock<AbstractQueryService<TestResolverDTO>>();
        const input: UpdateMany<TestResolverDTO, Partial<TestResolverDTO>> = {
          filter: {
            id: { in: ['id-1'] },
          },
          update: {
            stringField: 'foo',
          },
        };
        const output: UpdateManyResponse = {
          updatedCount: 1,
        };
        const resolver = new TestResolver(instance(mockService));
        when(mockService.updateMany(input)).thenResolve(output);
        const result = await resolver.updateMany(input);
        return expect(result).toEqual(output);
      });
    });
  });

  describe('delete methods', () => {
    it('should provide the delete options to the deleteResolverTypesFactory', () => {
      class DeleteType {
        stringField!: string;
      }

      const opts = {
        typeName: 'TestObj',
        DeleteType: () => DeleteType,
      };
      GraphQLQueryResolver(TestResolverDTO, opts);

      expect(readResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, { typeName: opts.typeName });
      const { QueryType } = readResolverTypesFactorySpy.mock.results[0].value;

      expect(deleteResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, {
        ...opts,
        FilterType: QueryType.FilterType,
      });
      const {
        DeleteType: DT,
        DeleteOneInputType,
        DeleteManyInputType,
      } = deleteResolverTypesFactorySpy.mock.results[0].value;
      expect(DT).toEqual(DeleteType);

      expect(resolverQuerySpy).toBeCalledTimes(1);
      assertArgsCall(0, { type: () => QueryType });

      expect(resolverMutationSpy).toBeCalledTimes(6);

      assertResolverMutationCall(4, DeleteType, { name: 'deleteOneTestObj' }, {}, {});
      assertArgsCall(5, { name: 'input', type: () => DeleteOneInputType });

      assertResolverMutationCall(5, DeleteManyResponseType, { name: 'deleteManyTestObjs' }, {}, {});
      assertArgsCall(6, { name: 'input', type: () => DeleteManyInputType });
    });

    describe('#deleteOne', () => {
      it('should provide the methods.queries and methods.deleteOne options to the deleteOne ResolverMethod decorator', () => {
        const mutationOpts: QueryMethodOptions = {
          disabled: false,
          filters: [],
          guards: [],
          interceptors: [],
          pipes: [],
        };
        const deleteOneOpts: QueryMethodOptions = {
          disabled: false,
          filters: [],
          guards: [FakeCanActivate],
          interceptors: [],
          pipes: [],
        };
        GraphQLQueryResolver(TestResolverDTO, {
          methods: {
            mutations: mutationOpts,
            deleteOne: deleteOneOpts,
          },
        });
        expect(createResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, {});
        const {
          DeleteManyInputType,
          DeleteOneInputType,
          DeleteType,
        } = deleteResolverTypesFactorySpy.mock.results[0].value;

        expect(resolverMutationSpy).toBeCalledTimes(6);
        assertResolverMutationCall(4, DeleteType, { name: 'deleteOneTestResolverDTO' }, mutationOpts, deleteOneOpts);
        assertArgsCall(5, { name: 'input', type: () => DeleteOneInputType });

        assertResolverMutationCall(5, DeleteManyResponseType, { name: 'deleteManyTestResolverDTOS' }, mutationOpts, {});
        assertArgsCall(6, { name: 'input', type: () => DeleteManyInputType });
      });

      it('should call the service deleteOne with the provided input', async () => {
        const mockService = mock<AbstractQueryService<TestResolverDTO>>();
        const input: DeleteOne = {
          id: 'id-1',
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'bar',
        };
        const resolver = new TestResolver(instance(mockService));
        when(mockService.deleteOne(input)).thenResolve(output);
        const result = await resolver.deleteOne(input);
        return expect(result).toEqual(output);
      });
    });

    describe('#deleteMany', () => {
      it('should provide the methods.queries and methods.deleteMany options to the deleteMany ResolverMethod decorator', () => {
        const mutationOpts: QueryMethodOptions = {
          disabled: false,
          filters: [],
          guards: [FakeCanActivate],
          interceptors: [],
          pipes: [],
        };
        const deleteManyOpts: QueryMethodOptions = {
          disabled: false,
          filters: [],
          guards: [],
          interceptors: [],
          pipes: [],
        };
        GraphQLQueryResolver(TestResolverDTO, {
          methods: {
            mutations: mutationOpts,
            deleteMany: deleteManyOpts,
          },
        });
        expect(createResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, {});
        const {
          DeleteManyInputType,
          DeleteOneInputType,
          DeleteType,
        } = deleteResolverTypesFactorySpy.mock.results[0].value;

        expect(resolverMutationSpy).toBeCalledTimes(6);
        assertResolverMutationCall(4, DeleteType, { name: 'deleteOneTestResolverDTO' }, mutationOpts, {});
        assertArgsCall(5, { name: 'input', type: () => DeleteOneInputType });

        assertResolverMutationCall(
          5,
          DeleteManyResponseType,
          { name: 'deleteManyTestResolverDTOS' },
          mutationOpts,
          deleteManyOpts,
        );
        assertArgsCall(6, { name: 'input', type: () => DeleteManyInputType });
      });

      it('should call the service deleteMany with the provided input', async () => {
        const mockService = mock<AbstractQueryService<TestResolverDTO>>();
        const input: DeleteMany<TestResolverDTO> = {
          filter: {
            id: { in: ['id-1'] },
          },
        };
        const output: DeleteManyResponse = {
          deletedCount: 1,
        };
        const resolver = new TestResolver(instance(mockService));
        when(mockService.deleteMany(input)).thenResolve(output);
        const result = await resolver.deleteMany(input);
        return expect(result).toEqual(output);
      });
    });
  });
});
