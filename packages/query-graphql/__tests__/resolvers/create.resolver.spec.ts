// eslint-disable-next-line max-classes-per-file
import 'reflect-metadata';
import { ID, ObjectType } from 'type-graphql';
import * as nestGraphql from '@nestjs/graphql';
import { instance, mock, when, objectContaining } from 'ts-mockito';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { QueryService, DeepPartial } from '@nestjs-query/core';
import { IsString } from 'class-validator';
import * as decorators from '../../src/decorators';
import { AdvancedOptions, ReturnTypeFuncValue } from '../../src/external/type-graphql.types';
import { CreateManyInputType, CreateOneInputType, CreateResolver } from '../../src';
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
  const createOneInputTypeSpy = jest.spyOn(types, 'CreateOneInputType');
  const createManyInputTypeSpy = jest.spyOn(types, 'CreateManyInputType');
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
    const CreateOneInput = CreateOneInputType(TestResolverDTO, TestResolverDTO);
    jest.clearAllMocks(); // reset
    CreateResolver(TestResolverDTO, { dtoName: 'Test', CreateOneInput });

    expect(createOneInputTypeSpy).not.toBeCalled();
    expect(createManyInputTypeSpy).toBeCalledWith(TestResolverDTO, expect.any(Function));

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

    expect(createOneInputTypeSpy).toBeCalledWith(UnnamedTestResolverDTO, expect.any(Function));
    expect(createManyInputTypeSpy).toBeCalledWith(UnnamedTestResolverDTO, expect.any(Function));

    expect(resolverMutationSpy).toBeCalledTimes(2);
    assertResolverMutationCall(0, UnnamedTestResolverDTO, { name: 'createOneUnnamedTestResolverDTO' }, {}, {});
    assertResolverMutationCall(1, [UnnamedTestResolverDTO], { name: 'createManyUnnamedTestResolverDTOS' }, {}, {});
    expect(argsSpy).toBeCalledWith();
    expect(argsSpy).toBeCalledTimes(2);
  });

  describe('#createOne', () => {
    it('should not create a new type if the CreateOneArgs is supplied', () => {
      const CreateOneInput = CreateOneInputType(TestResolverDTO, TestResolverDTO);
      jest.clearAllMocks(); // reset
      CreateResolver(TestResolverDTO, { CreateOneInput });

      expect(createOneInputTypeSpy).not.toBeCalled();
      expect(createManyInputTypeSpy).toBeCalledWith(TestResolverDTO, expect.any(Function));

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
      expect(createOneInputTypeSpy).toBeCalledWith(TestResolverDTO, expect.any(Function));
      expect(createManyInputTypeSpy).toBeCalledWith(TestResolverDTO, expect.any(Function));

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'createOneCreateResolverDTO' }, {}, createOneOpts);
      assertResolverMutationCall(1, [TestResolverDTO], { name: 'createManyCreateResolverDTOS' }, {}, {});
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service createOne with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const args: CreateOneInputType<TestResolverDTO, DeepPartial<TestResolverDTO>> = {
        input: {
          stringField: 'foo',
        },
      };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const resolver = new TestResolver(instance(mockService));
      when(mockService.createOne(objectContaining(args.input))).thenResolve(output);
      const result = await resolver.createOne({ input: args });
      return expect(result).toEqual(output);
    });
  });

  describe('#createMany', () => {
    it('should not create a new type if the CreateManyArgs is supplied', () => {
      const CreateManyInput = CreateManyInputType(TestResolverDTO, TestResolverDTO);
      jest.clearAllMocks(); // reset
      CreateResolver(TestResolverDTO, { CreateManyInput });

      expect(createOneInputTypeSpy).toBeCalledWith(TestResolverDTO, expect.any(Function));
      expect(createManyInputTypeSpy).not.toBeCalled();

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
      expect(createOneInputTypeSpy).toBeCalledWith(TestResolverDTO, expect.any(Function));
      expect(createManyInputTypeSpy).toBeCalledWith(TestResolverDTO, expect.any(Function));

      expect(resolverMutationSpy).toBeCalledTimes(2);
      assertResolverMutationCall(0, TestResolverDTO, { name: 'createOneCreateResolverDTO' }, {}, {});
      assertResolverMutationCall(1, [TestResolverDTO], { name: 'createManyCreateResolverDTOS' }, {}, createManyOpts);
      expect(argsSpy).toBeCalledWith();
      expect(argsSpy).toBeCalledTimes(2);
    });

    it('should call the service createMany with the provided input', async () => {
      const mockService = mock<QueryService<TestResolverDTO>>();
      const args: CreateManyInputType<TestResolverDTO, Partial<TestResolverDTO>> = {
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
      when(mockService.createMany(objectContaining(args.input))).thenResolve(output);
      const result = await resolver.createMany({ input: args });
      return expect(result).toEqual(output);
    });
  });
});
