import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { plainToClass } from 'class-transformer';
import { UpdateOneArgsType } from '../../src';

describe('UpdateOneInputType', (): void => {
  const argsTypeSpy = jest.spyOn(typeGraphql, 'ArgsType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  class FakeType {}
  it('should create an args type with the field as the type', () => {
    UpdateOneArgsType(FakeType);
    expect(argsTypeSpy).toBeCalledWith();
    expect(argsTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy).toBeCalledTimes(2);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.ID);
    expect(fieldSpy.mock.calls[1]![0]!()).toEqual(FakeType);
  });

  it('should return the input when accessing the update field', () => {
    const Type = UpdateOneArgsType(FakeType);
    const input = { id: 1, input: {} };
    const it = plainToClass(Type, input);
    expect(it.input).toEqual(input.input);
  });
});
