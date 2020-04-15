import 'reflect-metadata';
import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { ConnectionType } from '../../../src';
import { connectionObjectTypeSDL, expectSDL } from '../../__fixtures__';

describe('ConnectionType', (): void => {
  @ObjectType('Test')
  class TestDto {
    @Field()
    stringField!: string;
  }

  const TestConnection = ConnectionType(TestDto);

  it('should store metadata', async () => {
    @Resolver()
    class TestConnectionTypeResolver {
      @Query(() => TestConnection)
      test(): ConnectionType<TestDto> | undefined {
        return undefined;
      }
    }
    return expectSDL([TestConnectionTypeResolver], connectionObjectTypeSDL);
  });

  it('should throw an error if the object is not registered with @nestjs/graphql', () => {
    class TestBadDto {
      @Field()
      stringField!: string;
    }

    expect(() => ConnectionType(TestBadDto)).toThrow(
      'Unable to make ConnectionType. Ensure TestBadDto is annotated with @nestjs/graphql @ObjectType',
    );
  });

  describe('.createFromPromise', () => {
    it('should create a connections response with no connection args', async () => {
      const response = await TestConnection.createFromPromise(
        Promise.resolve([{ stringField: 'foo1' }, { stringField: 'foo2' }]),
        {},
      );
      expect(response).toEqual({
        edges: [
          {
            cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            node: {
              stringField: 'foo1',
            },
          },
          {
            cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            node: {
              stringField: 'foo2',
            },
          },
        ],
        pageInfo: {
          endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        },
      });
    });

    it('should create a connections response with just a first arg', async () => {
      const response = await TestConnection.createFromPromise(
        Promise.resolve([{ stringField: 'foo1' }, { stringField: 'foo2' }]),
        { first: 2 },
      );
      expect(response).toEqual({
        edges: [
          {
            cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            node: {
              stringField: 'foo1',
            },
          },
          {
            cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            node: {
              stringField: 'foo2',
            },
          },
        ],
        pageInfo: {
          endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        },
      });
    });

    it('should create a connections response with just a last arg', async () => {
      const response = await TestConnection.createFromPromise(
        Promise.resolve([{ stringField: 'foo1' }, { stringField: 'foo2' }]),
        {
          last: 2,
        },
      );
      expect(response).toEqual({
        edges: [
          {
            cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            node: {
              stringField: 'foo1',
            },
          },
          {
            cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            node: {
              stringField: 'foo2',
            },
          },
        ],
        pageInfo: {
          endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        },
      });
    });

    it('should create an empty connection', async () => {
      const response = await TestConnection.createFromPromise(Promise.resolve([]), {
        first: 2,
      });
      expect(response).toEqual({
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });
  });
});
