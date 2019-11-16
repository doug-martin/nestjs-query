import { ID } from 'type-graphql';
import * as typeGraphql from 'type-graphql';
import { GraphQLUpdateOneInput } from './update-one-input.type';

describe('CreateManyInput', (): void => {
  const inputTypeSpy = jest.spyOn(typeGraphql, 'InputType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  it('should create an abstract input type with the field as the type', () => {
    class FakeType {}
    GraphQLUpdateOneInput(FakeType);
    expect(inputTypeSpy).toBeCalledWith({ isAbstract: true });
    expect(fieldSpy).toBeCalledTimes(2);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(ID);
    expect(fieldSpy.mock.calls[1]![0]!()).toEqual(FakeType);
  });
});
