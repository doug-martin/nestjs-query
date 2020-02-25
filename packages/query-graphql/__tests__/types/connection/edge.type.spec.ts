import 'reflect-metadata';
import * as typeGraphql from 'type-graphql';
import { EdgeType } from '../../../src/types/connection';

describe('EdgeType', (): void => {
  const objectTypeSpy = jest.spyOn(typeGraphql, 'ObjectType');
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  afterEach(() => jest.clearAllMocks());

  @typeGraphql.ObjectType('Fake')
  class FakeType {}

  it('should create an edge type for the dto', () => {
    EdgeType(FakeType);
    expect(objectTypeSpy).toBeCalledWith(`FakeEdge`);
    expect(fieldSpy).toBeCalledTimes(2);
    expect(fieldSpy.mock.calls[0]![0]!()).toEqual(FakeType);
  });

  it('should return the same an edge type for a dto', () => {
    EdgeType(FakeType);
    expect(EdgeType(FakeType)).toBe(EdgeType(FakeType));
  });

  it('should not return the same an edge type for a different dto', () => {
    @typeGraphql.ObjectType('Fake2')
    class FakeTypeTwo {}
    expect(EdgeType(FakeType)).not.toBe(EdgeType(FakeTypeTwo));
  });

  it('should throw an error for a type that is not registered with types-graphql', () => {
    class BadDTO {}

    expect(() => EdgeType(BadDTO)).toThrowError(
      'Unable to make EdgeType for class. Ensure BadDTO is annotated with type-graphql @ObjectType',
    );
  });
});
