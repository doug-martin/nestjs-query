import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { CreateOneInputType } from '../../src';

describe('CreateOneInputType', (): void => {
  const inputTypeSpy = jest.spyOn(typeGraphql, 'InputType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  it('should create an abstract input type with the field as the type', () => {
    class FakeType {}
    CreateOneInputType(FakeType);
    expect(inputTypeSpy).toBeCalledWith({ isAbstract: true });
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(FakeType);
  });
});
