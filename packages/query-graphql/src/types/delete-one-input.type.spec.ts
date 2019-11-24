import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { GraphQLDeleteOneInput } from './delete-one-input.type';

describe('CreateManyInput', (): void => {
  const inputTypeSpy = jest.spyOn(typeGraphql, 'InputType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  it('should create an abstract input type with the field as the type', () => {
    GraphQLDeleteOneInput();
    expect(inputTypeSpy).toBeCalledWith({ isAbstract: true });
    expect(fieldSpy).toBeCalledTimes(1);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(typeGraphql.ID);
  });
});
