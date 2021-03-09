// eslint-disable-next-line max-classes-per-file
import { SortDirection, SortNulls } from '@nestjs-query/core';
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
import { CursorQueryArgsType, FilterableField, PagingStrategies, QueryArgsType } from '../../../src';
import {
  expectSDL,
  offsetQueryArgsFilterRequiredTypeSDL,
  offsetQueryArgsOptionsTypeSDL,
  offsetQueryArgsTypeSDL,
} from '../../__fixtures__';

describe('Offset paging strategy QueryArgsType with manual options', (): void => {
  afterEach(() => jest.clearAllMocks());

  @ObjectType('TestQuery')
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

  @ObjectType()
  class TestFilterRequiredDto {
    @FilterableField({ filterRequired: true })
    requiredFilterableField!: string;
  }

  @ArgsType()
  class TestOffsetQuery extends QueryArgsType(TestDto, { pagingStrategy: PagingStrategies.OFFSET }) {}

  it('create a query for string fields', async () => {
    @Resolver()
    class TestOffsetQueryArgsResolver {
      @Query(() => String)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args() query: TestOffsetQuery): string {
        return 'hello';
      }
    }
    return expectSDL([TestOffsetQueryArgsResolver], offsetQueryArgsTypeSDL);
  });

  it('should paging to the correct instance of paging', () => {
    const queryObj: TestOffsetQuery = {
      paging: {
        limit: 10,
        offset: 2,
      },
    };
    const queryInstance = plainToClass(TestOffsetQuery, queryObj);
    expect(validateSync(queryInstance)).toEqual([]);
    expect(queryInstance.paging).toBeInstanceOf(TestOffsetQuery.PageType);
  });

  it('should sorting to the correct instance of sorting', () => {
    const queryObj: TestOffsetQuery = {
      sorting: [{ field: 'stringField', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
    };
    const queryInstance = plainToClass(TestOffsetQuery, queryObj);
    expect(validateSync(queryInstance)).toEqual([]);
    expect(queryInstance.sorting![0]).toBeInstanceOf(TestOffsetQuery.SortType);
  });

  it('should make filter to the correct instance of sorting', () => {
    const queryObj: CursorQueryArgsType<TestDto> = {
      filter: {
        stringField: { eq: 'foo' },
      },
    };
    const queryInstance = plainToClass(TestOffsetQuery, queryObj);
    expect(validateSync(queryInstance)).toEqual([]);
    expect(queryInstance.filter).toBeInstanceOf(TestOffsetQuery.FilterType);
  });

  it('should make the filter required if there is a filterRequired field', () => {
    @ArgsType()
    class TestFilterRequiredQuery extends QueryArgsType(TestFilterRequiredDto, {
      pagingStrategy: PagingStrategies.OFFSET,
    }) {}

    @Resolver()
    class TestOffsetPagingFilterRequiredResolver {
      @Query(() => String)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args() query: TestFilterRequiredQuery): string {
        return 'hello';
      }
    }
    return expectSDL([TestOffsetPagingFilterRequiredResolver], offsetQueryArgsFilterRequiredTypeSDL);
  });

  describe('options', () => {
    @ObjectType()
    class OffsetQueryOptionsDTO extends TestDto {}
    @ArgsType()
    class OffsetQueryOptionsArgs extends QueryArgsType(OffsetQueryOptionsDTO, {
      pagingStrategy: PagingStrategies.OFFSET,
      defaultResultSize: 2,
      maxResultsSize: 5,
      defaultFilter: { booleanField: { is: true } },
      defaultSort: [{ field: 'booleanField', direction: SortDirection.DESC }],
    }) {}

    it('allow apply the options to the generated SDL', () => {
      @Resolver()
      class TestOffsetQueryManualOptionsResolver {
        @Query(() => String)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        test(@Args() query: OffsetQueryOptionsArgs): string {
          return 'hello';
        }
      }
      return expectSDL([TestOffsetQueryManualOptionsResolver], offsetQueryArgsOptionsTypeSDL);
    });

    it('validate a maxResultsSize for paging.limit', () => {
      const queryObj: CursorQueryArgsType<TestDto> = {
        paging: { limit: 10 },
      };
      const QT = QueryArgsType(TestDto, { pagingStrategy: PagingStrategies.OFFSET, maxResultsSize: 5 });
      const queryInstance = plainToClass(QT, queryObj);
      expect(validateSync(queryInstance)).toEqual([
        {
          children: [],
          constraints: {
            PropertyMax: 'Field paging.limit max allowed value is `5`.',
          },
          property: 'paging',
          target: queryObj,
          value: queryObj.paging,
        },
      ]);
    });
  });
});
