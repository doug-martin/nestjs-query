import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { UpdateOneInputType } from '../../src';

describe('UpdateOneInputType', (): void => {
  const inputTypeSpy = jest.spyOn(typeGraphql, 'InputType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  it('should create an abstract input type with the field as the type', () => {
    class FakeType {}
    UpdateOneInputType(FakeType);
    expect(inputTypeSpy).toBeCalledWith({ isAbstract: true });
    expect(fieldSpy).toBeCalledTimes(2);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.ID);
    expect(fieldSpy.mock.calls[1]![0]!()).toEqual(FakeType);
  });
});
