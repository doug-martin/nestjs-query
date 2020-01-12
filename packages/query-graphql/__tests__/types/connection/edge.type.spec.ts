import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { EdgeType } from '../../../src/types/connection';

describe('EdgeType', (): void => {
  const objectTypeSpy = jest.spyOn(typeGraphql, 'ObjectType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  @typeGraphql.ObjectType('Fake')
  class FakeType {}

  it('should create an edge type for the dto', () => {
    EdgeType(FakeType);
    expect(objectTypeSpy).toBeCalledWith(`FakeEdge`);
    expect(fieldSpy).toBeCalledTimes(2);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(FakeType);
  });

  it('should throw an error for a type that is not registered with types-graphql', () => {
    class BadDTO {}

    expect(() => EdgeType(BadDTO)).toThrowError(
      'Unable to make EdgeType for class. Ensure BadDTO is annotated with type-graphql @ObjectType',
    );
  });
});
