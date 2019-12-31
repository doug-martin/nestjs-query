import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { DeleteOneInputType } from '../../src';

describe('DeleteOneInputType', (): void => {
  const inputTypeSpy = jest.spyOn(typeGraphql, 'InputType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  it('should create an abstract input type with the field as the type', () => {
    DeleteOneInputType();
    expect(inputTypeSpy).toBeCalledWith({ isAbstract: true });
    expect(fieldSpy).toBeCalledTimes(1);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.ID);
  });
});
