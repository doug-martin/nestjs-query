import 'reflect-metadata';
import { ObjectType, Query, Resolver, Field } from '@nestjs/graphql';
import { EdgeType } from '../../../src/types/connection';
import { expectSDL, edgeObjectTypeSDL } from '../../__fixtures__';

describe('EdgeType', (): void => {
  @ObjectType()
  class FakeType {
    @Field()
    field!: string;
  }

  const TestEdge = EdgeType(FakeType);

  it('should create an edge type for the dto', () => {
    @Resolver()
    class TestEdgeTypeResolver {
      @Query(() => TestEdge)
      test(): EdgeType<FakeType> | undefined {
        return undefined;
      }
    }
    return expectSDL([TestEdgeTypeResolver], edgeObjectTypeSDL);
  });

  it('should return the same an edge type for a dto', () => {
    expect(TestEdge).toBe(EdgeType(FakeType));
  });

  it('should not return the same an edge type for a different dto', () => {
    @ObjectType('Fake2')
    class FakeTypeTwo {}
    expect(EdgeType(FakeType)).not.toBe(EdgeType(FakeTypeTwo));
  });

  it('should throw an error for a type that is not registered with types-graphql', () => {
    class BadDTO {}

    expect(() => EdgeType(BadDTO)).toThrow(
      'Unable to make EdgeType for class. Ensure BadDTO is annotated with @nestjs/graphql @ObjectType',
    );
  });
});
