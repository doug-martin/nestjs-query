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

  // @ts-ignore
  @ObjectType()
  class TestConnection extends ConnectionType(TestDto) {}

  @Resolver(TestDto)
  class TestConnectionTypeResolver {
    @Query(() => TestConnection)
    findConnection(): TestConnection | undefined {
      return undefined;
    }
  }

  it('should store metadata', () => {
    const schema = buildSchemaSync({ resolvers: [TestConnectionTypeResolver] });

    expect(printSchema(schema)).toContain(
      `"""Cursor for paging through collections"""
scalar ConnectionCursor

type PageInfo {
  hasNextPage: Boolean
  hasPreviousPage: Boolean
  startCursor: ConnectionCursor
  endCursor: ConnectionCursor
}

type Query {
  findConnection: TestConnection!
}

type Test {
  stringField: String!
}

type TestConnection {
  pageInfo: PageInfo!
  edges: [TestEdge!]!
}

type TestEdge {
  node: Test!

  """Used in \`before\` and \`after\` args"""
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
      'unable to make edge for class not registered with type-graphql TestBadDto',
    );
  });

  describe('.create', () => {
    it('should create a connections response with no connection args', async () => {
      const response = await TestConnection.create(Promise.resolve([{ stringField: 'foo1' }, { stringField: 'foo2' }]));
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
      const response = await TestConnection.create(
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
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
        },
      });
    });

    it('should create a connections response with just a last arg', async () => {
      const response = await TestConnection.create(
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
  });
});
