import 'reflect-metadata';
import { SortDirection, SortField, SortNulls } from '@nestjs-query/core';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { printSchema } from 'graphql';
import * as typeGraphql from 'type-graphql';
import { QueryArgsType, FilterableField } from '../../../src';

describe('QueryType', (): void => {
  const fieldSpy = jest.spyOn(typeGraphql, 'Field');

  afterEach(() => jest.clearAllMocks());

  @typeGraphql.ObjectType('TestQuery')
  class TestDto {
    @FilterableField(() => typeGraphql.ID)
    idField!: number;

    @FilterableField(() => typeGraphql.ID, { nullable: true })
    idFieldOption?: number;

    @FilterableField()
    stringField!: string;

    @FilterableField({ nullable: true })
    stringFieldOptional?: string;

    @FilterableField()
    booleanField!: boolean;

    @FilterableField({ nullable: true })
    booleanFieldOptional?: boolean;

    @FilterableField()
    numberField!: number;

    @FilterableField({ nullable: true })
    numberFieldOptional?: number;

    @FilterableField(() => typeGraphql.Float)
    floatField!: number;

    @FilterableField(() => typeGraphql.Float, { nullable: true })
    floatFieldOptional?: number;

    @FilterableField(() => typeGraphql.Int)
    intField!: number;

    @FilterableField(() => typeGraphql.Int, { nullable: true })
    intFieldOptional?: number;

    @FilterableField(() => typeGraphql.GraphQLTimestamp)
    timestampField!: Date;

    @FilterableField(() => typeGraphql.GraphQLTimestamp, { nullable: true })
    timestampFieldOptional?: Date;

    @FilterableField(() => typeGraphql.GraphQLISODateTime)
    date!: Date;

    @FilterableField(() => typeGraphql.GraphQLISODateTime, { nullable: true })
    dateOptional?: Date;
  }

  // @ts-ignore
  @typeGraphql.ArgsType()
  class TestQuery extends QueryArgsType(TestDto) {}

  @typeGraphql.Resolver()
  class TestResolver {
    @typeGraphql.Query()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    findConnection(@typeGraphql.Args() query: TestQuery): string {
      return 'hello';
    }
  }

  it('create a query for string fields', () => {
    const schema = typeGraphql.buildSchemaSync({ resolvers: [TestResolver] });
    expect(printSchema(schema)).toEqual(
      `input BooleanFieldComparison {
  is: Boolean
  isNot: Boolean
}

"""Cursor for paging through collections"""
scalar ConnectionCursor

input CursorPaging {
  """Paginate before opaque cursor"""
  before: ConnectionCursor

  """Paginate after opaque cursor"""
  after: ConnectionCursor

  """Paginate first"""
  first: Int

  """Paginate last"""
  last: Int
}

input DateFieldComparison {
  is: Boolean
  isNot: Boolean
  eq: DateTime
  neq: DateTime
  gt: DateTime
  gte: DateTime
  lt: DateTime
  lte: DateTime
  in: [DateTime!]
  notIn: [DateTime!]
}

"""
The javascript \`Date\` as string. Type represents date and time as the ISO Date string.
"""
scalar DateTime

input FloatFieldComparison {
  is: Boolean
  isNot: Boolean
  eq: Float
  neq: Float
  gt: Float
  gte: Float
  lt: Float
  lte: Float
  in: [Float!]
  notIn: [Float!]
}

input IDFilterComparison {
  is: Boolean
  isNot: Boolean
  eq: ID
  neq: ID
  gt: ID
  gte: ID
  lt: ID
  lte: ID
  like: ID
  notLike: ID
  iLike: ID
  notILike: ID
  in: [ID!]
  notIn: [ID!]
}

input IntFieldComparison {
  is: Boolean
  isNot: Boolean
  eq: Int
  neq: Int
  gt: Int
  gte: Int
  lt: Int
  lte: Int
  in: [Int!]
  notIn: [Int!]
}

input NumberFieldComparison {
  is: Boolean
  isNot: Boolean
  eq: Float
  neq: Float
  gt: Float
  gte: Float
  lt: Float
  lte: Float
  in: [Float!]
  notIn: [Float!]
}

type Query {
  findConnection(
    """Limit or page results."""
    paging: CursorPaging = {first: 10}

    """Specify to filter the records returned."""
    filter: TestQueryFilter = {}

    """Specify to sort results."""
    sorting: [TestQuerySort!] = []
  ): String!
}

"""Sort Directions"""
enum SortDirection {
  ASC
  DESC
}

"""Sort Nulls Options"""
enum SortNulls {
  NULLS_FIRST
  NULLS_LAST
}

input StringFieldComparison {
  is: Boolean
  isNot: Boolean
  eq: String
  neq: String
  gt: String
  gte: String
  lt: String
  lte: String
  like: String
  notLike: String
  iLike: String
  notILike: String
  in: [String!]
  notIn: [String!]
}

type TestQuery {
  idField: ID!
  idFieldOption: ID
  stringField: String!
  stringFieldOptional: String!
  booleanField: Boolean!
  booleanFieldOptional: Boolean!
  numberField: Float!
  numberFieldOptional: Float!
  floatField: Float!
  floatFieldOptional: Float
  intField: Int!
  intFieldOptional: Int
  timestampField: Timestamp!
  timestampFieldOptional: Timestamp
  date: DateTime!
  dateOptional: DateTime
}

input TestQueryFilter {
  and: [TestQueryFilter!]
  or: [TestQueryFilter!]
  idField: IDFilterComparison
  idFieldOption: IDFilterComparison
  stringField: StringFieldComparison
  stringFieldOptional: StringFieldComparison
  booleanField: BooleanFieldComparison
  booleanFieldOptional: BooleanFieldComparison
  numberField: NumberFieldComparison
  numberFieldOptional: NumberFieldComparison
  floatField: FloatFieldComparison
  floatFieldOptional: FloatFieldComparison
  intField: IntFieldComparison
  intFieldOptional: IntFieldComparison
  timestampField: TimestampFieldComparison
  timestampFieldOptional: TimestampFieldComparison
  date: DateFieldComparison
  dateOptional: DateFieldComparison
}

input TestQuerySort {
  field: TestQuerySortFields!
  direction: SortDirection!
  nulls: SortNulls
}

enum TestQuerySortFields {
  idField
  idFieldOption
  stringField
  stringFieldOptional
  booleanField
  booleanFieldOptional
  numberField
  numberFieldOptional
  floatField
  floatFieldOptional
  intField
  intFieldOptional
  timestampField
  timestampFieldOptional
  date
  dateOptional
}

"""
The javascript \`Date\` as integer. Type represents date and time as number of milliseconds from start of UNIX epoch.
"""
scalar Timestamp

input TimestampFieldComparison {
  is: Boolean
  isNot: Boolean
  eq: Timestamp
  neq: Timestamp
  gt: Timestamp
  gte: Timestamp
  lt: Timestamp
  lte: Timestamp
  in: [Timestamp!]
  notIn: [Timestamp!]
}
`,
    );
  });

  it('should paging to the correct instance of paging', () => {
    const queryObj: QueryArgsType<TestDto> = {
      paging: {
        first: 10,
        after: 'YXJyYXljb25uZWN0aW9uOjEw',
      },
    };
    const queryInstance = plainToClass(TestQuery, queryObj);
    expect(validateSync(queryInstance)).toEqual([]);
    expect(queryInstance.paging).toBeInstanceOf(TestQuery.PageType);
  });

  it('should sorting to the correct instance of sorting', () => {
    const queryObj: QueryArgsType<TestDto> = {
      sorting: [{ field: 'stringField', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
    };
    const queryInstance = plainToClass(TestQuery, queryObj);
    expect(validateSync(queryInstance)).toEqual([]);
    expect(queryInstance.sorting![0]).toBeInstanceOf(TestQuery.SortType);
  });

  it('should make filter to the correct instance of sorting', () => {
    const queryObj: QueryArgsType<TestDto> = {
      filter: {
        stringField: { eq: 'foo' },
      },
    };
    const queryInstance = plainToClass(TestQuery, queryObj);
    expect(validateSync(queryInstance)).toEqual([]);
    expect(queryInstance.filter).toBeInstanceOf(TestQuery.FilterType);
  });

  describe('options', () => {
    it('by default first should be set to 10 in the paging object', () => {
      QueryArgsType(TestDto);
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: { first: 10 },
        description: 'Limit or page results.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: {},
        description: 'Specify to filter the records returned.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: [],
        description: 'Specify to sort results.',
      });
    });

    it('allow specifying a defaultResultSize', () => {
      QueryArgsType(TestDto, { defaultResultSize: 2 });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: { first: 2 },
        description: 'Limit or page results.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: {},
        description: 'Specify to filter the records returned.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: [],
        description: 'Specify to sort results.',
      });
    });

    it('allow validate a maxResultsSize for paging.first', () => {
      const queryObj: QueryArgsType<TestDto> = {
        paging: { first: 10 },
      };
      const QT = QueryArgsType(TestDto, { maxResultsSize: 5 });
      const queryInstance = plainToClass(QT, queryObj);
      expect(validateSync(queryInstance)).toEqual([
        {
          children: [],
          constraints: {
            PropertyMax: 'Field paging.first max allowed value is `5`.',
          },
          property: 'paging',
          target: queryObj,
          value: queryObj.paging,
        },
      ]);
    });

    it('allow validate a maxResultsSize for paging.last', () => {
      const queryObj: QueryArgsType<TestDto> = {
        paging: { last: 10, before: 'abc' },
      };
      const QT = QueryArgsType(TestDto, { maxResultsSize: 5 });
      const queryInstance = plainToClass(QT, queryObj);
      expect(validateSync(queryInstance)).toEqual([
        {
          children: [],
          constraints: {
            PropertyMax: 'Field paging.last max allowed value is `5`.',
          },
          property: 'paging',
          target: queryObj,
          value: queryObj.paging,
        },
      ]);
    });

    it('allow specifying a default filter', () => {
      const filter = { booleanField: { is: true } };
      QueryArgsType(TestDto, { defaultFilter: filter });
      expect(fieldSpy).toHaveBeenNthCalledWith(1, expect.any(Function), {
        defaultValue: { first: 10 },
        description: 'Limit or page results.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: filter,
        description: 'Specify to filter the records returned.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: [],
        description: 'Specify to sort results.',
      });
    });

    it('allow specifying a default sort', () => {
      const sort: SortField<TestDto>[] = [{ field: 'booleanField', direction: SortDirection.DESC }];
      QueryArgsType(TestDto, { defaultSort: sort });
      expect(fieldSpy).toHaveBeenNthCalledWith(1, expect.any(Function), {
        defaultValue: { first: 10 },
        description: 'Limit or page results.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: {},
        description: 'Specify to filter the records returned.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: sort,
        description: 'Specify to sort results.',
      });
    });
  });
});
