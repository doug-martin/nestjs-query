import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { CreateManyArgsType } from '../../src';

describe('CreateManyArgsType', (): void => {
  const argsTypeSpy = jest.spyOn(typeGraphql, 'ArgsType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  class FakeType {}

  it('should create an ArgsType with an array field', () => {
    CreateManyArgsType(FakeType);
    expect(argsTypeSpy).toBeCalledWith();
    expect(argsTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual([FakeType]);
  });
});
