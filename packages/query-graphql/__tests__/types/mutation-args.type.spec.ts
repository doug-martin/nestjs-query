import 'reflect-metadata';
import * as nestjsGraphql from '@nestjs/graphql';
import * as classValidator from 'class-validator';
import { InputType } from '@nestjs/graphql';
import { MutationArgsType } from '../../src/types';

describe('MutationArgsType', (): void => {
  const argsTypeSpy = jest.spyOn(nestjsGraphql, 'ArgsType');
  const fieldSpy = jest.spyOn(nestjsGraphql, 'Field');
  const validateNestedSpy = jest.spyOn(classValidator, 'ValidateNested');

  @InputType()
  class FakeType {}

  beforeEach(() => jest.clearAllMocks());

  it('should create an args type with an array field', () => {
    MutationArgsType(FakeType);
    expect(argsTypeSpy).toBeCalledTimes(1);
    expect(argsTypeSpy).toBeCalledWith();
    expect(validateNestedSpy).toBeCalledTimes(1);
    expect(validateNestedSpy).toBeCalledWith();
    expect(fieldSpy).toBeCalledTimes(1);
    expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function));
    expect(fieldSpy.mock.calls[0]![0]!()).toBe(FakeType);
  });
});
