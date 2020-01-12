import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { plainToClass } from 'class-transformer';
import { CreateOneArgsType } from '../../src';

describe('CreateOneArgsType', (): void => {
  const argsTypeSpy = jest.spyOn(typeGraphql, 'ArgsType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  class FakeType {}
  it('should create an ArgsType with the field as the type', () => {
    CreateOneArgsType(FakeType);
    expect(argsTypeSpy).toBeCalledWith();
    expect(argsTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(FakeType);
  });

  it('should return the input when accessing the item field', () => {
    const Type = CreateOneArgsType(FakeType);
    const input = new FakeType();
    const it = plainToClass(Type, { input });
    expect(it.input).toEqual(input);
  });
});
