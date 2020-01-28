import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { DeleteManyArgsType } from '../../src';

describe('DeleteManyArgsType', (): void => {
  const argsTypeSpy = jest.spyOn(typeGraphql, 'ArgsType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  it('should create an args type with an array field', () => {
    class FakeFilter {}
    DeleteManyArgsType(FakeFilter);
    expect(argsTypeSpy).toBeCalledWith();
    expect(argsTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(FakeFilter);
  });
});
