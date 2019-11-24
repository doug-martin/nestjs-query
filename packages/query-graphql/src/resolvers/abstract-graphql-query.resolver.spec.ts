// eslint-disable-next-line max-classes-per-file
import 'reflect-metadata';
import * as nestGraphql from '@nestjs/graphql';
import { AbstractQueryService, CreateOne, CreateMany } from '@nestjs-query/core';
import { ID, ObjectType } from 'type-graphql';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { instance, mock, when } from 'ts-mockito';
import * as typeFactories from './type-factories';
import * as decorators from '../decorators';
import { GraphQLQueryResolver } from './abstract-graphql-query.resolver';
import { AdvancedOptions, ReturnTypeFuncValue } from '../external/type-graphql.types';
import { DeleteManyResponseType, UpdateManyResponseType } from '../types';

describe('GraphQLQueryResolver', () => {
  const createResolverTypesFactorySpy = jest.spyOn(typeFactories, 'createResolverTypesFactory');
  const deleteResolverTypesFactorySpy = jest.spyOn(typeFactories, 'deleteResolverTypesFactory');
  const readResolverTypesFactorySpy = jest.spyOn(typeFactories, 'readResolverTypesFactory');
  const updateResolverTypesFactorySpy = jest.spyOn(typeFactories, 'updateResolverTypesFactory');
  const resolverMethodSpy = jest.spyOn(decorators, 'ResolverMethod');
  const querySpy = jest.spyOn(nestGraphql, 'Query');
  const mutationSpy = jest.spyOn(nestGraphql, 'Mutation');
  const argsSpy = jest.spyOn(nestGraphql, 'Args');

  beforeEach(() => {
    createResolverTypesFactorySpy.mockClear();
    deleteResolverTypesFactorySpy.mockClear();
    readResolverTypesFactorySpy.mockClear();
    updateResolverTypesFactorySpy.mockClear();
    resolverMethodSpy.mockClear();
    querySpy.mockClear();
    mutationSpy.mockClear();
    argsSpy.mockClear();
  });

  @ObjectType()
  class TestResolverDTO {
    @decorators.FilterableField(() => ID)
    id!: string;

    @decorators.FilterableField()
    stringField!: string;
  }

  class FakeCanActivate implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      return false;
    }
  }

  class TestResolver extends GraphQLQueryResolver(TestResolverDTO) {
    constructor(service: AbstractQueryService<TestResolverDTO>) {
      super(service);
    }
  }

  function assertMutationCall<T>(callNo: number, returnType: ReturnTypeFuncValue, opts: AdvancedOptions) {
    expect(mutationSpy.mock.calls[callNo]![0]!()).toEqual(returnType);
    expect(mutationSpy.mock.calls[callNo]![1]!).toEqual(opts);
  }

  function assertQueryCall<T>(callNo: number, returnType: ReturnTypeFuncValue, opts: AdvancedOptions) {
    expect(querySpy.mock.calls[callNo]![0]!()).toEqual(returnType);
    expect(querySpy.mock.calls[callNo]![1]!).toEqual(opts);
  }

  function assertResolverMethodCall(callNo: number, ...opts: decorators.ResolverMethodOptions[]) {
    expect(resolverMethodSpy).toHaveBeenNthCalledWith(callNo + 1, ...opts);
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
    expect(resolverMethodSpy).toBeCalledTimes(7);

    expect(querySpy).toBeCalledTimes(1);
    assertQueryCall(0, ConnectionType, { name: 'testResolverDTOS' });
    assertResolverMethodCall(0, {}, {});
    assertArgsCall(0, { type: () => QueryType });

    expect(mutationSpy).toBeCalledTimes(6);
    assertMutationCall(0, TestResolverDTO, { name: 'createOneTestResolverDTO' });
    assertResolverMethodCall(1, {}, {});
    assertArgsCall(1, { name: 'input', type: () => CreateOneInputType });

    assertMutationCall(1, [TestResolverDTO], { name: 'createManyTestResolverDTOS' });
    assertResolverMethodCall(2, {}, {});
    assertArgsCall(2, { name: 'input', type: () => CreateManyInputType });

    assertMutationCall(2, TestResolverDTO, { name: 'updateOneTestResolverDTO' });
    assertResolverMethodCall(3, {}, {});
    assertArgsCall(3, { name: 'input', type: () => UpdateOneInputType });

    assertMutationCall(3, UpdateManyResponseType, { name: 'updateManyTestResolverDTOS' });
    assertResolverMethodCall(4, {}, {});
    assertArgsCall(4, { name: 'input', type: () => UpdateManyInputType });

    assertMutationCall(4, DeleteType, { name: 'deleteOneTestResolverDTO' });
    assertResolverMethodCall(5, {}, {});
    assertArgsCall(5, { name: 'input', type: () => DeleteOneInputType });

    assertMutationCall(5, DeleteManyResponseType, { name: 'deleteManyTestResolverDTOS' });
    assertResolverMethodCall(6, {}, {});
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

      expect(resolverMethodSpy).toBeCalledTimes(7);

      expect(mutationSpy).toBeCalledTimes(6);
      assertMutationCall(0, TestResolverDTO, { name: 'createOneTestObj' });
      assertResolverMethodCall(1, {}, {});
      assertArgsCall(1, { name: 'input', type: () => CreateOneInputType });

      assertMutationCall(1, [TestResolverDTO], { name: 'createManyTestObjs' });
      assertResolverMethodCall(2, {}, {});
      assertArgsCall(2, { name: 'input', type: () => CreateManyInputType });
    });

    it('should provide the methods.queries and methods.createOne options to the createOne ResolverMethod decorator', () => {
      const mutationOpts: decorators.ResolverMethodOptions = {
        disabled: false,
        filters: [],
        guards: [],
        interceptors: [],
        pipes: [],
      };
      const createOneOpts: decorators.ResolverMethodOptions = {
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

      expect(resolverMethodSpy).toBeCalledTimes(7);

      expect(mutationSpy).toBeCalledTimes(6);
      assertMutationCall(0, TestResolverDTO, { name: 'createOneTestResolverDTO' });
      assertResolverMethodCall(1, mutationOpts, createOneOpts);
      assertArgsCall(1, { name: 'input', type: () => CreateOneInputType });

      assertMutationCall(1, [TestResolverDTO], { name: 'createManyTestResolverDTOS' });
      assertResolverMethodCall(2, mutationOpts, {});
      assertArgsCall(2, { name: 'input', type: () => CreateManyInputType });
    });

    it('should provide the methods.queries and methods.createMany options to the createMany ResolverMethod decorator', () => {
      const mutationOpts: decorators.ResolverMethodOptions = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      const createManyOpts: decorators.ResolverMethodOptions = {
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

      expect(resolverMethodSpy).toBeCalledTimes(7);

      expect(mutationSpy).toBeCalledTimes(6);
      assertMutationCall(0, TestResolverDTO, { name: 'createOneTestResolverDTO' });
      assertResolverMethodCall(1, mutationOpts, {});
      assertArgsCall(1, { name: 'input', type: () => CreateOneInputType });

      assertMutationCall(1, [TestResolverDTO], { name: 'createManyTestResolverDTOS' });
      assertResolverMethodCall(2, mutationOpts, createManyOpts);
      assertArgsCall(2, { name: 'input', type: () => CreateManyInputType });
    });

    it('should call the service create one with the provided input', async () => {
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

    it('should call the service create many with the provided input', async () => {
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

  describe('read options', () => {
    it('should provide the read options to the readResolverTypesFactory', () => {
      const opts = {
        typeName: 'TestObj',
      };
      GraphQLQueryResolver(TestResolverDTO, opts);

      expect(readResolverTypesFactorySpy).toBeCalledWith(TestResolverDTO, opts);
      const { QueryType, ConnectionType } = readResolverTypesFactorySpy.mock.results[0].value;

      expect(querySpy).toBeCalledTimes(1);
      assertQueryCall(0, ConnectionType, { name: 'testObjs' });
      assertResolverMethodCall(0, {}, {});
      assertArgsCall(0, { type: () => QueryType });

      expect(mutationSpy).toBeCalledTimes(6);
    });
  });

  describe('update options', () => {
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
      expect(resolverMethodSpy).toBeCalledTimes(7);

      expect(querySpy).toBeCalledTimes(1);

      expect(mutationSpy).toBeCalledTimes(6);

      assertMutationCall(2, TestResolverDTO, { name: 'updateOneTestObj' });
      assertResolverMethodCall(3, {}, {});
      assertArgsCall(3, { name: 'input', type: () => UpdateOneInputType });

      assertMutationCall(3, UpdateManyResponseType, { name: 'updateManyTestObjs' });
      assertResolverMethodCall(4, {}, {});
      assertArgsCall(4, { name: 'input', type: () => UpdateManyInputType });
    });
  });

  describe('delete options', () => {
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

      expect(querySpy).toBeCalledTimes(1);
      assertArgsCall(0, { type: () => QueryType });

      expect(mutationSpy).toBeCalledTimes(6);

      assertMutationCall(4, DeleteType, { name: 'deleteOneTestObj' });
      assertResolverMethodCall(5, {}, {});
      assertArgsCall(5, { name: 'input', type: () => DeleteOneInputType });

      assertMutationCall(5, DeleteManyResponseType, { name: 'deleteManyTestObjs' });
      assertResolverMethodCall(6, {}, {});
      assertArgsCall(6, { name: 'input', type: () => DeleteManyInputType });
    });
  });
});
