import 'reflect-metadata';
import { buildSchemaSync, Field, ObjectType, Query, Resolver } from 'type-graphql';
import { printSchema } from 'graphql';
import { ConnectionType } from '../../../src';

describe('ConnectionType', (): void => {
  @ObjectType('Test')
  class TestDto {
    @Field()
    stringField!: string;
  }

  const TestConnection = ConnectionType(TestDto);

  @Resolver(TestDto)
  class TestConnectionTypeResolver {
    @Query(() => TestConnection)
    findConnection(): ConnectionType<TestDto> | undefined {
      return undefined;
    }
  }

  it('should store metadata', () => {
    const schema = buildSchemaSync({ resolvers: [TestConnectionTypeResolver] });

    expect(printSchema(schema)).toEqual(
      `"""Cursor for paging through collections"""
scalar ConnectionCursor

type PageInfo {
  """true if paging forward and there are more records."""
  hasNextPage: Boolean

  """true if paging backwards and there are more records."""
  hasPreviousPage: Boolean

  """The cursor of the first returned record."""
  startCursor: ConnectionCursor

  """The cursor of the last returned record."""
  endCursor: ConnectionCursor
}

type Query {
  findConnection: TestConnection!
}

type Test {
  stringField: String!
}

type TestConnection {
  """Paging information"""
  pageInfo: PageInfo!

  """Array of edges."""
  edges: [TestEdge!]!
}

type TestEdge {
  """The node containing the Test"""
  node: Test!

  """Cursor for this node."""
  cursor: ConnectionCursor!
}
`,
    );
  });

  it('should throw an error if the object is not registered with type-graphql', () => {
    class TestBadDto {
      @Field()
      stringField!: string;
    }

    expect(() => ConnectionType(TestBadDto)).toThrow(
      'Unable to make ConnectionType. Ensure TestBadDto is annotated with type-graphql @ObjectType',
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
