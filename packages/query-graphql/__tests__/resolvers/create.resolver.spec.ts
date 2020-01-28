// eslint-disable-next-line max-classes-per-file
import 'reflect-metadata';
import { ID, ObjectType } from 'type-graphql';
import * as nestGraphql from '@nestjs/graphql';
import { instance, mock, when, deepEqual } from 'ts-mockito';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { QueryService, DeepPartial } from '@nestjs-query/core';
import { IsString } from 'class-validator';
import * as decorators from '../../src/decorators';
import { AdvancedOptions, ReturnTypeFuncValue } from '../../src/external/type-graphql.types';
import { CreateManyArgsType, CreateOneArgsType, CreateResolver } from '../../src';
import * as types from '../../src/types';

@ObjectType('CreateResolverDTO')
class TestResolverDTO {
  @decorators.FilterableField(() => ID)
  @IsString()
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
describe('CreateResolver', () => {
  const resolverMutationSpy = jest.spyOn(decorators, 'ResolverMutation');
  const createOneArgsTypeSpy = jest.spyOn(types, 'CreateOneArgsType');
  const createManyArgsTypeSpy = jest.spyOn(types, 'CreateManyArgsType');
  const argsSpy = jest.spyOn(nestGraphql, 'Args');

  beforeEach(() => jest.clearAllMocks());

  class TestResolver extends CreateResolver(TestResolverDTO) {
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

  it('should use the dtoName if provided', () => {
    const CreateOneArgs = CreateOneArgsType(TestResolverDTO);
    jest.clearAllMocks(); // reset
    CreateResolver(TestResolverDTO, { dtoName: 'Test', CreateOneArgs });

    expect(createOneArgsTypeSpy).not.toBeCalled();
    expect(createManyArgsTypeSpy).toBeCalledWith(expect.any(Function));

    expect(resolverMutationSpy).toBeCalledTimes(2);
    assertResolverMutationCall(0, TestResolverDTO, { name: 'createOneTest' }, {}, {});
    assertResolverMutationCall(1, [TestResolverDTO], { name: 'createManyTests' }, {}, {});
    expect(argsSpy).toBeCalledWith();
    expect(argsSpy).toBeCalledTimes(2);
  });

  it('should use the class name if name not found in object metadata', () => {
    @ObjectType()
    class UnnamedTestResolverDTO {
      @decorators.FilterableField(() => ID)
      id!: string;
    }
    CreateResolver(UnnamedTestResolverDTO);

    expect(createOneArgsTypeSpy).toBeCalledWith(expect.any(Function));
    expect(createManyArgsTypeSpy).toBeCalledWith(expect.any(Function));

    expect(resolverMutationSpy).toBeCalledTimes(2);
    assertResolverMutationCall(0, UnnamedTestResolverDTO, { name: 'createOneUnnamedTestResolverDTO' }, {}, {});
    assertResolverMutationCall(1, [UnnamedTestResolverDTO], { name: 'createManyUnnamedTestResolverDTOS' }, {}, {});
    expect(argsSpy).toBeCalledWith();
    expect(argsSpy).toBeCalledTimes(2);
  });

  describe('#createOne', () => {
    it('should not create a new type if the CreateOneArgs is supplied', () => {
      const CreateOneArgs = CreateOneArgsType(TestResolverDTO);
      jest.clearAllMocks(); // reset
      CreateResolver(TestResolverDTO, { CreateOneArgs });

      expect(createOneArgsTypeSpy).not.toBeCalled();
      expect(createManyArgsTypeSpy).toBeCalledWith(expect.any(Function));

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'createOneCreateResolverDTO' }, {}, {});
      assertResolverMutationCall(1, [TestResolverDTO], { name: 'createManyCreateResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should provide the createOneOpts to the ResolverMethod decorator', () => {
      const createOneOpts: decorators.ResolverMethodOpts = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      CreateResolver(TestResolverDTO, { one: createOneOpts });
      expect(createOneArgsTypeSpy).toBeCalledWith(expect.any(Function));
      expect(createManyArgsTypeSpy).toBeCalledWith(expect.any(Function));

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'createOneCreateResolverDTO' }, {}, createOneOpts);
      assertResolverMutationCall(1, [TestResolverDTO], { name: 'createManyCreateResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service createOne with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const args: CreateOneArgsType<DeepPartial<TestResolverDTO>> = {
        input: {
          stringField: 'foo',
        },
      };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const resolver = new TestResolver(instance(mockService));
      when(mockService.createOne(deepEqual(args.input))).thenResolve(output);
      const result = await resolver.createOne(args);
      return expect(result).toEqual(output);
    });
  });

  describe('#createMany', () => {
    it('should not create a new type if the CreateManyArgs is supplied', () => {
      const CreateManyArgs = CreateManyArgsType(TestResolverDTO);
      jest.clearAllMocks(); // reset
      CreateResolver(TestResolverDTO, { CreateManyArgs });

      expect(createOneArgsTypeSpy).toBeCalledWith(expect.any(Function));
      expect(createManyArgsTypeSpy).not.toBeCalled();

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'createOneCreateResolverDTO' }, {}, {});
      assertResolverMutationCall(1, [TestResolverDTO], { name: 'createManyCreateResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should provide the createMany options to the createMany ResolverMethod decorator', () => {
      const createManyOpts: decorators.ResolverMethodOpts = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      CreateResolver(TestResolverDTO, { many: createManyOpts });
      expect(createOneArgsTypeSpy).toBeCalledWith(expect.any(Function));
      expect(createManyArgsTypeSpy).toBeCalledWith(expect.any(Function));

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'createOneCreateResolverDTO' }, {}, {});
      assertResolverMutationCall(1, [TestResolverDTO], { name: 'createManyCreateResolverDTOS' }, {}, createManyOpts);
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service createMany with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const args: CreateManyArgsType<Partial<TestResolverDTO>> = {
        input: [
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
      when(mockService.createMany(deepEqual(args.input))).thenResolve(output);
      const result = await resolver.createMany(args);
      return expect(result).toEqual(output);
    });
  });
});
