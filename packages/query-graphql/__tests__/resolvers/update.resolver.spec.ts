import 'reflect-metadata';
import { ID, ObjectType } from 'type-graphql';
import * as nestGraphql from '@nestjs/graphql';
import { instance, mock, when, objectContaining } from 'ts-mockito';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { QueryService, UpdateManyResponse } from '@nestjs-query/core';
import * as decorators from '../../src/decorators';
import { AdvancedOptions, ReturnTypeFuncValue } from '../../src/external/type-graphql.types';
import {
  FilterType,
  Updateable,
  UpdateManyArgsType,
  UpdateManyResponseType,
  UpdateOneArgsType,
  UpdateResolver,
} from '../../src';
import * as types from '../../src/types';

@ObjectType('UpdateResolverDTO')
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

describe('UpdateResolver', () => {
  const resolverMutationSpy = jest.spyOn(decorators, 'ResolverMutation');
  const updateOneArgsTypeSpy = jest.spyOn(types, 'UpdateOneArgsType');
  const updateManyArgsTypeSpy = jest.spyOn(types, 'UpdateManyArgsType');
  const argsSpy = jest.spyOn(nestGraphql, 'Args');

  beforeEach(() => jest.clearAllMocks());

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

  class TestResolver extends UpdateResolver(TestResolverDTO) {
    constructor(service: QueryService<TestResolverDTO>) {
      super(service);
    }
  }

  it('should create an UpdateResolver with the default DTO', () => {
    UpdateResolver(TestResolverDTO);

    expect(updateOneArgsTypeSpy).toBeCalledWith(TestResolverDTO);
    expect(updateManyArgsTypeSpy).toBeCalledWith(expect.any(Function), TestResolverDTO);

    expect(resolverMutationSpy).toBeCalledTimes(2);
    assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, {});
    assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyUpdateResolverDTOS' }, {});
    expect(argsSpy).toBeCalledWith();
    expect(argsSpy).toBeCalledTimes(2);
  });

  it('should use the dtoName if provided', () => {
    const UpdateOneArgs = UpdateOneArgsType(TestResolverDTO);
    jest.clearAllMocks(); // reset
    UpdateResolver(TestResolverDTO, { dtoName: 'Test', UpdateOneArgs });

    expect(updateOneArgsTypeSpy).not.toBeCalled();
    expect(updateManyArgsTypeSpy).toBeCalledWith(expect.any(Function), TestResolverDTO);

    expect(resolverMutationSpy).toBeCalledTimes(2);
    assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneTest' }, {});
    assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyTests' }, {});
    expect(argsSpy).toBeCalledWith();
    expect(argsSpy).toBeCalledTimes(2);
  });

  describe('#updateOne', () => {
    it('should not update a new type if the UpdateOneArgs is supplied', () => {
      const UpdateOneArgs = UpdateOneArgsType(TestResolverDTO);
      jest.clearAllMocks(); // reset
      UpdateResolver(TestResolverDTO, { UpdateOneArgs });

      expect(updateOneArgsTypeSpy).not.toBeCalled();
      expect(updateManyArgsTypeSpy).toBeCalledWith(expect.any(Function), TestResolverDTO);

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, {});
      assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyUpdateResolverDTOS' }, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should provide the updateOneOpts to the ResolverMethod decorator', () => {
      const updateOneOpts: decorators.ResolverMethodOptions = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      UpdateResolver(TestResolverDTO, { updateOne: updateOneOpts });
      expect(updateOneArgsTypeSpy).toBeCalledWith(TestResolverDTO);
      expect(updateManyArgsTypeSpy).toBeCalledWith(expect.any(Function), TestResolverDTO);

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, updateOneOpts);
      assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyUpdateResolverDTOS' }, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service updateOne with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const input: UpdateOneArgsType<TestResolverDTO, Partial<TestResolverDTO>> = {
        id: 'id-1',
        input: {
          stringField: 'foo',
        },
      };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const resolver = new TestResolver(instance(mockService));
      when(mockService.updateOne(objectContaining({ id: input.id, update: input.input }))).thenResolve(output);
      const result = await resolver.updateOne(input);
      return expect(result).toEqual(output);
    });
  });

  describe('#updateMany', () => {
    it('should not update a new type if the UpdateManyArgs is supplied', () => {
      const UpdateManyArgs = UpdateManyArgsType(FilterType(TestResolverDTO), TestResolverDTO);
      jest.clearAllMocks(); // reset
      UpdateResolver(TestResolverDTO, { UpdateManyArgs });

      expect(updateOneArgsTypeSpy).toBeCalledWith(TestResolverDTO);
      expect(updateManyArgsTypeSpy).not.toBeCalled();

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, {});
      assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyUpdateResolverDTOS' }, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should provide the updateMany options to the updateMany ResolverMethod decorator', () => {
      const updateManyOpts: decorators.ResolverMethodOptions = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      UpdateResolver(TestResolverDTO, { updateMany: updateManyOpts });
      expect(updateOneArgsTypeSpy).toBeCalledWith(TestResolverDTO);
      expect(updateManyArgsTypeSpy).toBeCalledWith(expect.any(Function), TestResolverDTO);

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, {});
      assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyUpdateResolverDTOS' }, updateManyOpts);
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service updateMany with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const input: UpdateManyArgsType<TestResolverDTO, Partial<TestResolverDTO>> = {
        filter: { id: { eq: 'id-1' } },
        input: {
          stringField: 'foo',
        },
      };
      const output: UpdateManyResponse = { updatedCount: 1 };
      const resolver = new TestResolver(instance(mockService));
      when(mockService.updateMany(objectContaining({ filter: input.filter, update: input.input }))).thenResolve(output);
      const result = await resolver.updateMany(input);
      return expect(result).toEqual(output);
    });
  });
});

describe('Updateable', () => {
  const resolverMutationSpy = jest.spyOn(decorators, 'ResolverMutation');
  const updateOneArgsTypeSpy = jest.spyOn(types, 'UpdateOneArgsType');
  const updateManyArgsTypeSpy = jest.spyOn(types, 'UpdateManyArgsType');
  const argsSpy = jest.spyOn(nestGraphql, 'Args');

  beforeEach(() => jest.clearAllMocks());

  class BaseResolver {
    constructor(readonly service: QueryService<TestResolverDTO>) {}
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

  it('should create an UpdateResolver with the default DTO', () => {
    Updateable<TestResolverDTO, Partial<TestResolverDTO>>(TestResolverDTO)(BaseResolver);

    expect(updateOneArgsTypeSpy).toBeCalledWith(TestResolverDTO);
    expect(updateManyArgsTypeSpy).toBeCalledWith(expect.any(Function), TestResolverDTO);

    expect(resolverMutationSpy).toBeCalledTimes(2);
    assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, {});
    assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyUpdateResolverDTOS' }, {});
    expect(argsSpy).toBeCalledWith();
    expect(argsSpy).toBeCalledTimes(2);
  });

  it('should use the dtoName if provided', () => {
    const UpdateOneArgs = UpdateOneArgsType(TestResolverDTO);
    jest.clearAllMocks(); // reset
    Updateable(TestResolverDTO, { dtoName: 'Test', UpdateOneArgs })(BaseResolver);

    expect(updateOneArgsTypeSpy).not.toBeCalled();
    expect(updateManyArgsTypeSpy).toBeCalledWith(expect.any(Function), TestResolverDTO);

    expect(resolverMutationSpy).toBeCalledTimes(2);
    assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneTest' }, {});
    assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyTests' }, {});
    expect(argsSpy).toBeCalledWith();
    expect(argsSpy).toBeCalledTimes(2);
  });

  describe('#updateOne', () => {
    it('should not update a new type if the UpdateOneArgs is supplied', () => {
      const UpdateOneArgs = UpdateOneArgsType(TestResolverDTO);
      jest.clearAllMocks(); // reset
      Updateable(TestResolverDTO, { UpdateOneArgs })(BaseResolver);

      expect(updateOneArgsTypeSpy).not.toBeCalled();
      expect(updateManyArgsTypeSpy).toBeCalledWith(expect.any(Function), TestResolverDTO);

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, {});
      assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyUpdateResolverDTOS' }, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should provide the updateOneOpts to the ResolverMethod decorator', () => {
      const updateOneOpts: decorators.ResolverMethodOptions = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      Updateable(TestResolverDTO, { updateOne: updateOneOpts })(BaseResolver);
      expect(updateOneArgsTypeSpy).toBeCalledWith(TestResolverDTO);
      expect(updateManyArgsTypeSpy).toBeCalledWith(expect.any(Function), TestResolverDTO);

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, updateOneOpts);
      assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyUpdateResolverDTOS' }, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service updateOne with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const input: UpdateOneArgsType<TestResolverDTO, Partial<TestResolverDTO>> = {
        id: 'id-1',
        input: {
          stringField: 'foo',
        },
      };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const resolver = new (Updateable(TestResolverDTO)(BaseResolver))(instance(mockService));
      when(mockService.updateOne(objectContaining({ id: input.id, update: input.input }))).thenResolve(output);
      const result = await resolver.updateOne(input);
      return expect(result).toEqual(output);
    });
  });

  describe('#updateMany', () => {
    it('should not update a new type if the UpdateManyArgs is supplied', () => {
      const UpdateManyArgs = UpdateManyArgsType(FilterType(TestResolverDTO), TestResolverDTO);
      jest.clearAllMocks(); // reset
      UpdateResolver(TestResolverDTO, { UpdateManyArgs });

      expect(updateOneArgsTypeSpy).toBeCalledWith(TestResolverDTO);
      expect(updateManyArgsTypeSpy).not.toBeCalled();

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, {});
      assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyUpdateResolverDTOS' }, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should provide the updateMany options to the updateMany ResolverMethod decorator', () => {
      const updateManyOpts: decorators.ResolverMethodOptions = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      UpdateResolver(TestResolverDTO, { updateMany: updateManyOpts });
      expect(updateOneArgsTypeSpy).toBeCalledWith(TestResolverDTO);
      expect(updateManyArgsTypeSpy).toBeCalledWith(expect.any(Function), TestResolverDTO);

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, {});
      assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyUpdateResolverDTOS' }, updateManyOpts);
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service updateMany with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const input: UpdateManyArgsType<TestResolverDTO, Partial<TestResolverDTO>> = {
        filter: { id: { eq: 'id-1' } },
        input: {
          stringField: 'foo',
        },
      };
      const output: UpdateManyResponse = { updatedCount: 1 };
      const resolver = new (Updateable(TestResolverDTO)(BaseResolver))(instance(mockService));
      when(mockService.updateMany(objectContaining({ filter: input.filter, update: input.input }))).thenResolve(output);
      const result = await resolver.updateMany(input);
      return expect(result).toEqual(output);
    });
  });
});
