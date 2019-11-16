import { Filter } from '@nestjs-query/core';
import * as typeGraphql from 'type-graphql';
import { GraphQLUpdateManyInput } from './update-many-input.type';

describe('CreateManyInput', (): void => {
  const inputTypeSpy = jest.spyOn(typeGraphql, 'InputType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  it('should create an abstract input type with an array field', () => {
    class FakeType {}
    class FakeFilter implements Filter<FakeType> {}
    GraphQLUpdateManyInput(FakeFilter, FakeType);
    expect(inputTypeSpy).toBeCalledWith({ isAbstract: true });
    expect(fieldSpy).toBeCalledTimes(2);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(FakeFilter);
    expect(fieldSpy.mock.calls[1]![0]!()).toEqual(FakeType);
  });
});
