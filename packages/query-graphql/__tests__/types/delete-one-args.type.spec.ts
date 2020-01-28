import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { DeleteOneArgsType } from '../../src';

describe('DeleteOneArgsType', (): void => {
  const argsTypeSpy = jest.spyOn(typeGraphql, 'ArgsType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  it('should create an args type with the field as the type', () => {
    DeleteOneArgsType();
    expect(argsTypeSpy).toBeCalledWith();
    expect(argsTypeSpy).toBeCalledTimes(1);
    expect(fieldSpy).toBeCalledTimes(1);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.ID);
  });
});
