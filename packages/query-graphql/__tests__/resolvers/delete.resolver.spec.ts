import 'reflect-metadata';
import { ID, ObjectType } from 'type-graphql';
import * as nestGraphql from '@nestjs/graphql';
import { instance, mock, when, deepEqual } from 'ts-mockito';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { QueryService, DeleteManyResponse } from '@nestjs-query/core';
import * as decorators from '../../src/decorators';
import { AdvancedOptions, ReturnTypeFuncValue } from '../../src/external/type-graphql.types';
import { FilterType, DeleteManyArgsType, DeleteManyResponseType, DeleteOneArgsType, DeleteResolver } from '../../src';
import * as types from '../../src/types';

@ObjectType('DeleteResolverDTO')
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

describe('DeleteResolver', () => {
  const resolverMutationSpy = jest.spyOn(decorators, 'ResolverMutation');
  const deleteOneArgsTypeSpy = jest.spyOn(types, 'DeleteOneArgsType');
  const deleteManyArgsTypeSpy = jest.spyOn(types, 'DeleteManyArgsType');
  const argsSpy = jest.spyOn(nestGraphql, 'Args');

  beforeEach(() => jest.clearAllMocks());

  class TestResolver extends DeleteResolver(TestResolverDTO) {
    constructor(service: QueryService<TestResolverDTO>) {
      super(service);
    }
  }

  function assertResolverMutationCall(
    callNo: number,
    returnType: ReturnTypeFuncValue,
    advancedOpts: AdvancedOptions,
    ...opts: decorators.ResolverMethodOpts[]
  ) {
    const [rt, ao, ...rest] = resolverMutationSpy.mock.calls[callNo]!;
    expect(rt()).toEqual(returnType);
    expect(ao).toEqual(advancedOpts);
    expect(rest).toEqual(opts);
  }

  it('should create a DeleteResolver for the DTO', () => {
    DeleteResolver(TestResolverDTO);

    expect(deleteOneArgsTypeSpy).toBeCalledWith();
    expect(deleteManyArgsTypeSpy).toBeCalledWith(expect.any(Function));

    expect(resolverMutationSpy).toBeCalledTimes(2);
    assertResolverMutationCall(0, expect.any(Function), { name: 'deleteOneDeleteResolverDTO' }, {}, {});
    assertResolverMutationCall(1, DeleteManyResponseType(), { name: 'deleteManyDeleteResolverDTOS' }, {}, {});
    expect(argsSpy).toBeCalledWith();
    expect(argsSpy).toBeCalledTimes(2);
  });

  it('should use the dtoName if provided', () => {
    const DeleteOneArgs = DeleteOneArgsType();
    jest.clearAllMocks(); // reset
    DeleteResolver(TestResolverDTO, { dtoName: 'Test', DeleteOneArgs });

    expect(deleteOneArgsTypeSpy).not.toBeCalled();
    expect(deleteManyArgsTypeSpy).toBeCalledWith(expect.any(Function));

    expect(resolverMutationSpy).toBeCalledTimes(2);
    assertResolverMutationCall(0, expect.any(Function), { name: 'deleteOneTest' }, {}, {});
    assertResolverMutationCall(1, DeleteManyResponseType(), { name: 'deleteManyTests' }, {}, {});
    expect(argsSpy).toBeCalledWith();
    expect(argsSpy).toBeCalledTimes(2);
  });

  describe('#deleteOne', () => {
    it('should not delete a new type if the DeleteOneArgs is supplied', () => {
      const DeleteOneArgs = DeleteOneArgsType();
      jest.clearAllMocks(); // reset
      DeleteResolver(TestResolverDTO, { DeleteOneArgs });

      expect(deleteOneArgsTypeSpy).not.toBeCalled();
      expect(deleteManyArgsTypeSpy).toBeCalledWith(expect.any(Function));

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, expect.any(Function), { name: 'deleteOneDeleteResolverDTO' }, {}, {});
      assertResolverMutationCall(1, DeleteManyResponseType(), { name: 'deleteManyDeleteResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should provide the deleteOneOpts to the ResolverMethod decorator', () => {
      const deleteOneOpts: decorators.ResolverMethodOpts = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      DeleteResolver(TestResolverDTO, { one: deleteOneOpts });
      expect(deleteOneArgsTypeSpy).toBeCalledWith();
      expect(deleteManyArgsTypeSpy).toBeCalledWith(expect.any(Function));

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, expect.any(Function), { name: 'deleteOneDeleteResolverDTO' }, {}, deleteOneOpts);
      assertResolverMutationCall(1, DeleteManyResponseType(), { name: 'deleteManyDeleteResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service deleteOne with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const input: DeleteOneArgsType = {
        id: 'id-1',
      };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const resolver = new TestResolver(instance(mockService));
      when(mockService.deleteOne(input.id)).thenResolve(output);
      const result = await resolver.deleteOne(input);
      return expect(result).toEqual(output);
    });
  });

  describe('#deleteMany', () => {
    it('should not delete a new type if the DeleteManyArgs is supplied', () => {
      const DeleteManyArgs = DeleteManyArgsType(FilterType(TestResolverDTO));
      jest.clearAllMocks(); // reset
      DeleteResolver(TestResolverDTO, { DeleteManyArgs });

      expect(deleteOneArgsTypeSpy).toBeCalledWith();
      expect(deleteManyArgsTypeSpy).not.toBeCalled();

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, expect.any(Function), { name: 'deleteOneDeleteResolverDTO' }, {}, {});
      assertResolverMutationCall(1, DeleteManyResponseType(), { name: 'deleteManyDeleteResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should provide the deleteMany options to the deleteMany ResolverMethod decorator', () => {
      const deleteManyOpts: decorators.ResolverMethodOpts = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      DeleteResolver(TestResolverDTO, { many: deleteManyOpts });
      expect(deleteOneArgsTypeSpy).toBeCalledWith();
      expect(deleteManyArgsTypeSpy).toBeCalledWith(expect.any(Function));

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, expect.any(Function), { name: 'deleteOneDeleteResolverDTO' }, {}, {});
      assertResolverMutationCall(
        1,
        DeleteManyResponseType(),
        { name: 'deleteManyDeleteResolverDTOS' },
        {},
        deleteManyOpts,
      );
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service deleteMany with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const input: DeleteManyArgsType<TestResolverDTO> = {
        input: { id: { eq: 'id-1' } },
      };
      const output: DeleteManyResponse = { deletedCount: 1 };
      const resolver = new TestResolver(instance(mockService));
      when(mockService.deleteMany(deepEqual(input.input))).thenResolve(output);
      const result = await resolver.deleteMany(input);
      return expect(result).toEqual(output);
    });
  });
});
