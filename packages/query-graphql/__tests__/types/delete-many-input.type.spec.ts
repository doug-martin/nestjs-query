import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { DeleteManyInputType } from '../../src';

describe('DeleteManyInputType', (): void => {
  const inputTypeSpy = jest.spyOn(typeGraphql, 'InputType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  it('should create an abstract input type with an array field', () => {
    class FakeFilter {}
    DeleteManyInputType(FakeFilter);
    expect(inputTypeSpy).toBeCalledWith({ isAbstract: true });
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(FakeFilter);
  });
});
