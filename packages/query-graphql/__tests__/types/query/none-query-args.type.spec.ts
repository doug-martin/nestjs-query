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
import { generateSchema } from '../../__fixtures__';

describe('None paging strategy QueryArgsType with manual options', (): void => {
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
  class TestNoPagingQuery extends QueryArgsType(TestDto, { pagingStrategy: PagingStrategies.NONE }) {}

  it('create a query for string fields', async () => {
    @Resolver()
    class TestNonePagingStrategyResolver {
      @Query(() => String)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args() query: TestNoPagingQuery): string {
        return 'hello';
      }
    }
    const schema = await generateSchema([TestNonePagingStrategyResolver]);
    expect(schema).toMatchSnapshot();
  });

  it('should sorting to the correct instance of sorting', () => {
    const queryObj: TestNoPagingQuery = {
      sorting: [{ field: 'stringField', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
    };
    const queryInstance = plainToClass(TestNoPagingQuery, queryObj);
    expect(validateSync(queryInstance)).toEqual([]);
    expect(queryInstance.sorting![0]).toBeInstanceOf(TestNoPagingQuery.SortType);
  });

  it('should make filter to the correct instance of sorting', () => {
    const queryObj: CursorQueryArgsType<TestDto> = {
      filter: {
        stringField: { eq: 'foo' },
      },
    };
    const queryInstance = plainToClass(TestNoPagingQuery, queryObj);
    expect(validateSync(queryInstance)).toEqual([]);
    expect(queryInstance.filter).toBeInstanceOf(TestNoPagingQuery.FilterType);
  });

  it('should make the filter required if there is a filterRequired field', async () => {
    @ArgsType()
    class TestFilterRequiredQuery extends QueryArgsType(TestFilterRequiredDto, {
      pagingStrategy: PagingStrategies.NONE,
    }) {}

    @Resolver()
    class TestNonePagingFilterRequiredResolver {
      @Query(() => String)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args() query: TestFilterRequiredQuery): string {
        return 'hello';
      }
    }
    const schema = await generateSchema([TestNonePagingFilterRequiredResolver]);
    expect(schema).toMatchSnapshot();
  });

  describe('options', () => {
    @ObjectType()
    class NoPagingQueryOptionsDTO extends TestDto {}
    @ArgsType()
    class NoPagingQueryOptionsArgs extends QueryArgsType(NoPagingQueryOptionsDTO, {
      pagingStrategy: PagingStrategies.NONE,
      defaultResultSize: 2,
      maxResultsSize: 5,
      defaultFilter: { booleanField: { is: true } },
      defaultSort: [{ field: 'booleanField', direction: SortDirection.DESC }],
    }) {}

    it('allow apply the options to the generated SDL', async () => {
      @Resolver()
      class TestNoPagingQueryManualOptionsResolver {
        @Query(() => String)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        test(@Args() query: NoPagingQueryOptionsArgs): string {
          return 'hello';
        }
      }
      const schema = await generateSchema([TestNoPagingQueryManualOptionsResolver]);
      expect(schema).toMatchSnapshot();
    });
  });
});
