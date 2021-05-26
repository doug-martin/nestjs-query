// eslint-disable-next-line max-classes-per-file
import { SortDirection } from '@nestjs-query/core';
import {
  Args,
  ArgsType,
  Float,
  GraphQLISODateTime,
  GraphQLTimestamp,
  ID,
  Int,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { FilterableField, PagingStrategies, QueryArgsType, QueryOptions } from '../../../src';
import { generateSchema } from '../../__fixtures__';

describe('QueryArgsType with decorator options', (): void => {
  afterEach(() => jest.clearAllMocks());

  @ObjectType('TestQuery')
  @QueryOptions({
    pagingStrategy: PagingStrategies.CURSOR,
    defaultResultSize: 2,
    maxResultsSize: 5,
    defaultFilter: { booleanField: { is: true } },
    defaultSort: [{ field: 'booleanField', direction: SortDirection.DESC }],
  })
  class TestDto {
    @FilterableField(() => ID)
    idField!: number;

    @FilterableField(() => ID, { nullable: true })
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

    @FilterableField(() => Float)
    floatField!: number;

    @FilterableField(() => Float, { nullable: true })
    floatFieldOptional?: number;

    @FilterableField(() => Int)
    intField!: number;

    @FilterableField(() => Int, { nullable: true })
    intFieldOptional?: number;

    @FilterableField(() => GraphQLTimestamp)
    timestampField!: Date;

    @FilterableField(() => GraphQLTimestamp, { nullable: true })
    timestampFieldOptional?: Date;

    @FilterableField(() => GraphQLISODateTime)
    date!: Date;

    @FilterableField(() => GraphQLISODateTime, { nullable: true })
    dateOptional?: Date;
  }

  @ArgsType()
  class CursorQueryOptionsArgs extends QueryArgsType(TestDto) {}

  it('allow apply the options to the generated SDL', async () => {
    @Resolver()
    class TestCursorQueryOptionsDecoratorResolver {
      @Query(() => String)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args() query: CursorQueryOptionsArgs): string {
        return 'hello';
      }
    }
    const schema = await generateSchema([TestCursorQueryOptionsDecoratorResolver]);
    expect(schema).toMatchSnapshot();
  });

  describe('max result size', () => {
    it('should validate a maxResultsSize for paging.first', () => {
      const queryObj: CursorQueryOptionsArgs = {
        paging: { first: 10 },
      };
      const queryInstance = plainToClass(CursorQueryOptionsArgs, queryObj);
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

    it('should validate a maxResultsSize for paging.last', () => {
      const queryObj: CursorQueryOptionsArgs = {
        paging: { last: 10, before: 'abc' },
      };
      const queryInstance = plainToClass(CursorQueryOptionsArgs, queryObj);
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
  });
});
