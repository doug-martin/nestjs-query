import 'reflect-metadata';
import * as nestGraphql from '@nestjs/graphql';
import { instance, mock, when, objectContaining } from 'ts-mockito';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { QueryService, UpdateManyResponse } from '@nestjs-query/core';
import { ReturnTypeFuncValue, MutationOptions } from '@nestjs/graphql';
import * as decorators from '../../src/decorators';
import {
  MutationArgsType,
  UpdateManyInputType,
  UpdateManyResponseType,
  UpdateOneInputType,
  UpdateResolver,
} from '../../src';
import * as types from '../../src/types';

const { ID, ObjectType } = nestGraphql;

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
  const updateOneInputTypeSpy = jest.spyOn(types, 'UpdateOneInputType');
  const updateManyInputTypeSpy = jest.spyOn(types, 'UpdateManyInputType');
  const argsSpy = jest.spyOn(nestGraphql, 'Args');

  beforeEach(() => jest.clearAllMocks());

  function assertResolverMutationCall(
    callNo: number,
    returnType: ReturnTypeFuncValue,
    advancedOpts: MutationOptions,
    ...opts: decorators.ResolverMethodOpts[]
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

    expect(updateOneInputTypeSpy).toBeCalledWith(expect.any(Function));
    expect(updateManyInputTypeSpy).toBeCalledWith(TestResolverDTO, expect.any(Function));

    expect(resolverMutationSpy).toBeCalledTimes(2);
    assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, {}, {});
    assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyUpdateResolverDTOS' }, {}, {});
    expect(argsSpy).toBeCalledWith();
    expect(argsSpy).toBeCalledTimes(2);
  });

  it('should use the dtoName if provided', () => {
    const UpdateOneInput = UpdateOneInputType(TestResolverDTO);
    jest.clearAllMocks(); // reset
    UpdateResolver(TestResolverDTO, { dtoName: 'Test', UpdateOneInput });

    expect(updateOneInputTypeSpy).not.toBeCalled();
    expect(updateManyInputTypeSpy).toBeCalledWith(expect.any(Function), expect.any(Function));

    expect(resolverMutationSpy).toBeCalledTimes(2);
    assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneTest' }, {}, {});
    assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyTests' }, {}, {});
    expect(argsSpy).toBeCalledWith();
    expect(argsSpy).toBeCalledTimes(2);
  });

  describe('#updateOne', () => {
    it('should not update a new type if the UpdateOneArgs is supplied', () => {
      const UpdateOneInput = UpdateOneInputType(TestResolverDTO);
      jest.clearAllMocks(); // reset
      UpdateResolver(TestResolverDTO, { UpdateOneInput });

      expect(updateOneInputTypeSpy).not.toBeCalled();
      expect(updateManyInputTypeSpy).toBeCalledWith(expect.any(Function), expect.any(Function));

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, {}, {});
      assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyUpdateResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should provide the updateOneOpts to the ResolverMethod decorator', () => {
      const updateOneOpts: decorators.ResolverMethodOpts = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      UpdateResolver(TestResolverDTO, { one: updateOneOpts });
      expect(updateOneInputTypeSpy).toBeCalledWith(expect.any(Function));
      expect(updateManyInputTypeSpy).toBeCalledWith(TestResolverDTO, expect.any(Function));

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, {}, updateOneOpts);
      assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyUpdateResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service updateOne with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const input: UpdateOneInputType<Partial<TestResolverDTO>> = {
        id: 'id-1',
        update: {
          stringField: 'foo',
        },
      };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const resolver = new TestResolver(instance(mockService));
      when(mockService.updateOne(input.id, objectContaining(input.update))).thenResolve(output);
      const result = await resolver.updateOne({ input });
      return expect(result).toEqual(output);
    });
  });

  describe('#updateMany', () => {
    it('should not update a new type if the UpdateManyArgs is supplied', () => {
      const UpdateManyInput = UpdateManyInputType(TestResolverDTO, TestResolverDTO);
      jest.clearAllMocks(); // reset
      UpdateResolver(TestResolverDTO, { UpdateManyInput });

      expect(updateOneInputTypeSpy).toBeCalledWith(expect.any(Function));
      expect(updateManyInputTypeSpy).not.toBeCalled();

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, {}, {});
      assertResolverMutationCall(1, UpdateManyResponseType(), { name: 'updateManyUpdateResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should provide the updateMany options to the updateMany ResolverMethod decorator', () => {
      const updateManyOpts: decorators.ResolverMethodOpts = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      UpdateResolver(TestResolverDTO, { many: updateManyOpts });
      expect(updateOneInputTypeSpy).toBeCalledWith(expect.any(Function));
      expect(updateManyInputTypeSpy).toBeCalledWith(TestResolverDTO, expect.any(Function));

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'updateOneUpdateResolverDTO' }, {}, {});
      assertResolverMutationCall(
        1,
        UpdateManyResponseType(),
        { name: 'updateManyUpdateResolverDTOS' },
        {},
        updateManyOpts,
      );
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service updateMany with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const input: MutationArgsType<UpdateManyInputType<TestResolverDTO, Partial<TestResolverDTO>>> = {
        input: {
          filter: { id: { eq: 'id-1' } },
          update: {
            stringField: 'foo',
          },
        },
      };
      const output: UpdateManyResponse = { updatedCount: 1 };
      const resolver = new TestResolver(instance(mockService));
      when(
        mockService.updateMany(objectContaining(input.input.update), objectContaining(input.input.filter)),
      ).thenResolve(output);
      const result = await resolver.updateMany(input);
      return expect(result).toEqual(output);
    });
  });
});
