import 'reflect-metadata';
import { ID, ObjectType } from 'type-graphql';
import * as nestGraphql from '@nestjs/graphql';
import { instance, mock, when, objectContaining } from 'ts-mockito';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { QueryService, Query } from '@nestjs-query/core';
import * as decorators from '../../src/decorators';
import { AdvancedOptions, ReturnTypeFuncValue } from '../../src/external/type-graphql.types';
import { ConnectionType, QueryArgsType, Readable, ReadResolver } from '../../src';
import * as types from '../../src/types';

@ObjectType('ReadResolverDTO')
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

describe('ReadResolver', () => {
  const resolverQuerySpy = jest.spyOn(decorators, 'ResolverQuery');
  const queryArgsTypeSpy = jest.spyOn(types, 'QueryArgsType');
  const connectionTypeSpy = jest.spyOn(types, 'ConnectionType');
  const argsSpy = jest.spyOn(nestGraphql, 'Args');

  beforeEach(() => jest.clearAllMocks());

  class TestResolver extends ReadResolver(TestResolverDTO) {
    constructor(service: QueryService<TestResolverDTO>) {
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

  it('should use the dtoName if provided', () => {
    const QueryArgs = QueryArgsType(TestResolverDTO);
    jest.clearAllMocks(); // reset
    ReadResolver(TestResolverDTO, { dtoName: 'Test', QueryArgs });

    expect(queryArgsTypeSpy).not.toBeCalled();
    expect(connectionTypeSpy).toBeCalledWith(TestResolverDTO);
    const Connection = connectionTypeSpy.mock.results[0].value;

    expect(resolverQuerySpy).toBeCalledTimes(2);
    assertResolverQueryCall(0, TestResolverDTO, { name: 'test', nullable: true }, {}, {});
    assertResolverQueryCall(1, Connection, { name: 'tests' }, {}, {});
    expect(argsSpy).toBeCalledWith();
    expect(argsSpy).toBeCalledTimes(2);
  });

  describe('#query', () => {
    it('should not create a new type if the QueryArgs is supplied', () => {
      const QueryArgs = QueryArgsType(TestResolverDTO);
      jest.clearAllMocks(); // reset
      ReadResolver(TestResolverDTO, { QueryArgs });

      expect(queryArgsTypeSpy).not.toBeCalled();
      expect(connectionTypeSpy).toBeCalledWith(TestResolverDTO);
      const Connection = connectionTypeSpy.mock.results[0].value;
      expect(resolverQuerySpy).toBeCalledTimes(2);
      assertResolverQueryCall(0, TestResolverDTO, { name: 'readResolverDTO', nullable: true }, {}, {});
      assertResolverQueryCall(1, Connection, { name: 'readResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should not create a new type if the Connection is supplied', () => {
      const Connection = ConnectionType(TestResolverDTO);
      jest.clearAllMocks(); // reset
      ReadResolver(TestResolverDTO, { Connection });

      expect(queryArgsTypeSpy).toBeCalledWith(TestResolverDTO);
      expect(connectionTypeSpy).not.toBeCalled();

      expect(resolverQuerySpy).toBeCalledTimes(2);
      assertResolverQueryCall(0, TestResolverDTO, { name: 'readResolverDTO', nullable: true }, {}, {});
      assertResolverQueryCall(1, Connection, { name: 'readResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should provide the query opts to the ResolverMethod decorator', () => {
      const queryOpts: decorators.ResolverMethodOptions = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      ReadResolver(TestResolverDTO, { many: queryOpts });
      expect(queryArgsTypeSpy).toBeCalledWith(TestResolverDTO);
      expect(connectionTypeSpy).toBeCalledWith(TestResolverDTO);
      const Connection = connectionTypeSpy.mock.results[0].value;

      expect(resolverQuerySpy).toBeCalledTimes(2);
      assertResolverQueryCall(0, TestResolverDTO, { name: 'readResolverDTO', nullable: true }, {}, {});
      assertResolverQueryCall(1, Connection, { name: 'readResolverDTOS' }, {}, queryOpts);
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service query with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const input: Query<TestResolverDTO> = {
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
      when(mockService.query(objectContaining(input))).thenResolve(output);
      const result = await resolver.queryMany(input);
      return expect(result).toEqual({
        edges: [
          {
            cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            node: {
              id: 'id-1',
              stringField: 'foo',
            },
          },
        ],
        pageInfo: {
          endCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        },
      });
    });
  });

  describe('#findById', () => {
    it('should provide the findById options to the findById ResolverMethod decorator', () => {
      const findById: decorators.ResolverMethodOptions = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      ReadResolver(TestResolverDTO, { one: findById });
      expect(queryArgsTypeSpy).toBeCalledWith(TestResolverDTO);
      expect(connectionTypeSpy).toBeCalledWith(TestResolverDTO);
      const Connection = connectionTypeSpy.mock.results[0].value;

      expect(resolverQuerySpy).toBeCalledTimes(2);
      assertResolverQueryCall(0, TestResolverDTO, { name: 'readResolverDTO', nullable: true }, {}, findById);
      assertResolverQueryCall(1, Connection, { name: 'readResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service findById with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const input = 'id-1';
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const resolver = new TestResolver(instance(mockService));
      when(mockService.findById(input)).thenResolve(output);
      const result = await resolver.queryOne(input);
      return expect(result).toEqual(output);
    });
  });
});

describe('Readable', () => {
  const resolverQuerySpy = jest.spyOn(decorators, 'ResolverQuery');
  const queryArgsTypeSpy = jest.spyOn(types, 'QueryArgsType');
  const connectionTypeSpy = jest.spyOn(types, 'ConnectionType');
  const argsSpy = jest.spyOn(nestGraphql, 'Args');

  beforeEach(() => jest.clearAllMocks());

  class BaseResolver {
    constructor(readonly service: QueryService<TestResolverDTO>) {}
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

  it('should use the dtoName if provided', () => {
    const QueryArgs = QueryArgsType(TestResolverDTO);
    jest.clearAllMocks(); // reset
    Readable(TestResolverDTO, { dtoName: 'Test', QueryArgs })(BaseResolver);

    expect(queryArgsTypeSpy).not.toBeCalled();
    expect(connectionTypeSpy).toBeCalledWith(TestResolverDTO);
    const Connection = connectionTypeSpy.mock.results[0].value;

    expect(resolverQuerySpy).toBeCalledTimes(2);
    assertResolverQueryCall(0, TestResolverDTO, { name: 'test', nullable: true }, {}, {});
    assertResolverQueryCall(1, Connection, { name: 'tests' }, {}, {});
    expect(argsSpy).toBeCalledWith();
    expect(argsSpy).toBeCalledTimes(2);
  });

  describe('#query', () => {
    it('should not create a new type if the QueryArgs is supplied', () => {
      const QueryArgs = QueryArgsType(TestResolverDTO);
      jest.clearAllMocks(); // reset
      Readable(TestResolverDTO, { QueryArgs })(BaseResolver);

      expect(queryArgsTypeSpy).not.toBeCalled();
      expect(connectionTypeSpy).toBeCalledWith(TestResolverDTO);
      const Connection = connectionTypeSpy.mock.results[0].value;
      expect(resolverQuerySpy).toBeCalledTimes(2);
      assertResolverQueryCall(0, TestResolverDTO, { name: 'readResolverDTO', nullable: true }, {}, {});
      assertResolverQueryCall(1, Connection, { name: 'readResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should not create a new type if the Connection is supplied', () => {
      const Connection = ConnectionType(TestResolverDTO);
      jest.clearAllMocks(); // reset
      Readable(TestResolverDTO, { Connection })(BaseResolver);

      expect(queryArgsTypeSpy).toBeCalledWith(TestResolverDTO);
      expect(connectionTypeSpy).not.toBeCalled();

      expect(resolverQuerySpy).toBeCalledTimes(2);
      assertResolverQueryCall(0, TestResolverDTO, { name: 'readResolverDTO', nullable: true }, {}, {});
      assertResolverQueryCall(1, Connection, { name: 'readResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should provide the query opts to the ResolverMethod decorator', () => {
      const queryOpts: decorators.ResolverMethodOptions = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      Readable(TestResolverDTO, { many: queryOpts })(BaseResolver);
      expect(queryArgsTypeSpy).toBeCalledWith(TestResolverDTO);
      expect(connectionTypeSpy).toBeCalledWith(TestResolverDTO);
      const Connection = connectionTypeSpy.mock.results[0].value;

      expect(resolverQuerySpy).toBeCalledTimes(2);
      assertResolverQueryCall(0, TestResolverDTO, { name: 'readResolverDTO', nullable: true }, {}, {});
      assertResolverQueryCall(1, Connection, { name: 'readResolverDTOS' }, {}, queryOpts);
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service query with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const input: Query<TestResolverDTO> = {
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
      const resolver = new (Readable(TestResolverDTO)(BaseResolver))(instance(mockService));
      when(mockService.query(objectContaining(input))).thenResolve(output);
      const result = await resolver.queryMany(input);
      return expect(result).toEqual({
        edges: [
          {
            cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            node: {
              id: 'id-1',
              stringField: 'foo',
            },
          },
        ],
        pageInfo: {
          endCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        },
      });
    });
  });

  describe('#findById', () => {
    it('should provide the findById options to the findById ResolverMethod decorator', () => {
      const findById: decorators.ResolverMethodOptions = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      Readable(TestResolverDTO, { one: findById })(BaseResolver);
      expect(queryArgsTypeSpy).toBeCalledWith(TestResolverDTO);
      expect(connectionTypeSpy).toBeCalledWith(TestResolverDTO);
      const Connection = connectionTypeSpy.mock.results[0].value;

      expect(resolverQuerySpy).toBeCalledTimes(2);
      assertResolverQueryCall(0, TestResolverDTO, { name: 'readResolverDTO', nullable: true }, {}, findById);
      assertResolverQueryCall(1, Connection, { name: 'readResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service findById with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const input = 'id-1';
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const resolver = new (Readable(TestResolverDTO)(BaseResolver))(instance(mockService));
      when(mockService.findById(objectContaining(input))).thenResolve(output);
      const result = await resolver.queryOne(input);
      return expect(result).toEqual(output);
    });
  });
});
